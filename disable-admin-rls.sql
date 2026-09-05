-- Disable RLS or create permissive policies for anonymous admin access
-- WARNING: This allows anyone to access and modify your data
-- Only use this for development or if you understand the security implications

-- First, drop existing admin-only policies
DROP POLICY IF EXISTS "Admins have full access to gallery" ON gallery;
DROP POLICY IF EXISTS "Admins have full access to events" ON events;
DROP POLICY IF EXISTS "Admins have full access to packages" ON packages;
DROP POLICY IF EXISTS "Admins have full access to testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins have full access to FAQs" ON faqs;
DROP POLICY IF EXISTS "Admins can view all enquiries" ON enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON enquiries;
DROP POLICY IF EXISTS "Admins can view event registrations" ON event_registrations;

-- Allow anonymous full access to gallery table
CREATE POLICY "Allow anonymous gallery access" ON gallery
  FOR ALL USING (true);

-- Allow anonymous full access to events table
CREATE POLICY "Allow anonymous events access" ON events
  FOR ALL USING (true);

-- Allow anonymous full access to packages table
CREATE POLICY "Allow anonymous packages access" ON packages
  FOR ALL USING (true);

-- Allow anonymous full access to testimonials table
CREATE POLICY "Allow anonymous testimonials access" ON testimonials
  FOR ALL USING (true);

-- Allow anonymous full access to faqs table
CREATE POLICY "Allow anonymous faqs access" ON faqs
  FOR ALL USING (true);

-- Allow anonymous full access to enquiries table
CREATE POLICY "Allow anonymous enquiries access" ON enquiries
  FOR ALL USING (true);

-- Allow anonymous full access to event_registrations table
CREATE POLICY "Allow anonymous event_registrations access" ON event_registrations
  FOR ALL USING (true);
