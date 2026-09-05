-- ============================================
-- FIX PUBLIC ACCESS TO ACADEMY TABLES
-- This script fixes RLS policies to allow public read access
-- while maintaining proper admin controls
-- ============================================

-- 1. DROP EXISTING RESTRICTIVE POLICIES
DROP POLICY IF EXISTS "Public can view active gallery" ON gallery;
DROP POLICY IF EXISTS "Public can view active events" ON events;
DROP POLICY IF EXISTS "Public can view active packages" ON packages;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view active FAQs" ON faqs;

-- 2. CREATE PERMISSIVE PUBLIC READ POLICIES
-- Allow anyone to read from gallery table
CREATE POLICY "Public read gallery" ON gallery
  FOR SELECT USING (true);

-- Allow anyone to read from events table  
CREATE POLICY "Public read events" ON events
  FOR SELECT USING (true);

-- Allow anyone to read from packages table
CREATE POLICY "Public read packages" ON packages
  FOR SELECT USING (true);

-- Allow anyone to read from testimonials table
CREATE POLICY "Public read testimonials" ON testimonials
  FOR SELECT USING (true);

-- Allow anyone to read from faqs table
CREATE POLICY "Public read faqs" ON faqs
  FOR SELECT USING (true);

-- 3. ENSURE ADMIN POLICIES EXIST FOR WRITE ACCESS
-- Gallery admin access
DROP POLICY IF EXISTS "Admins have full access to gallery" ON gallery;
CREATE POLICY "Admin full gallery access" ON gallery
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.jwt() ->> 'email' = 'your@email.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Events admin access
DROP POLICY IF EXISTS "Admins have full access to events" ON events;
CREATE POLICY "Admin full events access" ON events
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.jwt() ->> 'email' = 'your@email.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Packages admin access
DROP POLICY IF EXISTS "Admins have full access to packages" ON packages;
CREATE POLICY "Admin full packages access" ON packages
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.jwt() ->> 'email' = 'your@email.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Testimonials admin access
DROP POLICY IF EXISTS "Admins have full access to testimonials" ON testimonials;
CREATE POLICY "Admin full testimonials access" ON testimonials
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.jwt() ->> 'email' = 'your@email.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- FAQs admin access
DROP POLICY IF EXISTS "Admins have full access to FAQs" ON faqs;
CREATE POLICY "Admin full faqs access" ON faqs
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.jwt() ->> 'email' = 'your@email.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Enquiries admin access
DROP POLICY IF EXISTS "Admins can view all enquiries" ON enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON enquiries;
CREATE POLICY "Admin full enquiries access" ON enquiries
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.jwt() ->> 'email' = 'your@email.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- Event registrations admin access
DROP POLICY IF EXISTS "Admins can view event registrations" ON event_registrations;
CREATE POLICY "Admin full registrations access" ON event_registrations
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      auth.jwt() ->> 'email' = 'your@email.com' OR
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- 4. VERIFY POLICIES ARE WORKING
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('gallery', 'events', 'packages', 'testimonials', 'faqs', 'enquiries', 'event_registrations')
ORDER BY tablename, policyname;

-- 5. TEST ANONYMOUS ACCESS
-- You can test this by running:
-- SELECT COUNT(*) FROM gallery;
-- SELECT COUNT(*) FROM events;  
-- SELECT COUNT(*) FROM packages;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Public access policies updated successfully!';
  RAISE NOTICE 'Anonymous users can now read from all academy tables';
  RAISE NOTICE 'Admins retain full access for content management';
  RAISE NOTICE 'Test your public pages - they should now show database content';
END $$;