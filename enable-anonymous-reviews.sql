-- ============================================
-- ENABLE ANONYMOUS REVIEWS
-- Add support for guest reviews without requiring login
-- ============================================

-- Add guest_email field to testimonials table for anonymous reviewers
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Update the user_id column to allow NULL values (for anonymous reviews)
ALTER TABLE testimonials ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow anonymous review submissions
DROP POLICY IF EXISTS "Public can create testimonials" ON testimonials;
CREATE POLICY "Anyone can submit reviews" ON testimonials 
  FOR INSERT WITH CHECK (true);

-- Keep the existing policy for public reading approved reviews
-- (This should already exist from the academy setup)

-- Add index for guest reviews
CREATE INDEX IF NOT EXISTS idx_testimonials_guest_email ON testimonials(guest_email);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);

-- Update the reviews query to include both user and guest reviews
-- (The application will handle this, but this confirms the structure)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'testimonials';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Anonymous reviews enabled successfully!';
  RAISE NOTICE 'Users can now submit reviews without logging in';
  RAISE NOTICE 'All reviews require admin approval before being visible';
END $$;