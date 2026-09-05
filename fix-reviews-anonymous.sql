-- ============================================
-- Fix Reviews Table for Anonymous Reviews
-- ============================================

-- Add is_approved column for admin moderation
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add guest_email column for anonymous reviewers
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Update existing reviews to be approved (so they remain visible)
UPDATE reviews SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_guest_email ON reviews(guest_email);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Update RLS policies to allow anonymous users to insert reviews
DROP POLICY IF EXISTS "Users insert own review" ON reviews;

-- New policy: Allow authenticated users to insert their own reviews, and anonymous users to insert reviews
CREATE POLICY "Users can insert reviews" ON reviews 
  FOR INSERT 
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Update select policy to only show approved reviews
DROP POLICY IF EXISTS "Reviews are public" ON reviews;
CREATE POLICY "Public can view approved reviews" ON reviews 
  FOR SELECT 
  USING (is_approved = true);

-- Allow users to update their own reviews
DROP POLICY IF EXISTS "Users update own review" ON reviews;
CREATE POLICY "Users update own reviews" ON reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
DROP POLICY IF EXISTS "Users delete own review" ON reviews;
CREATE POLICY "Users delete own reviews" ON reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow admins to manage all reviews (approve/disapprove)
-- Note: This requires the admin to be identified, which typically uses a separate admin check
-- For now, we'll handle admin operations through the application layer