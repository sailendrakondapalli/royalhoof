-- QUICK FIX: Allow public access to view gallery and packages
-- Run this in Supabase SQL Editor

-- Drop restrictive policies
DROP POLICY IF EXISTS "Public can view active gallery" ON gallery;
DROP POLICY IF EXISTS "Public can view active packages" ON packages;
DROP POLICY IF EXISTS "Public can view active events" ON events;

-- Allow anyone to read gallery, packages, and events
CREATE POLICY "Anyone can read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Anyone can read packages" ON packages FOR SELECT USING (true);  
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);

-- Test the fix
SELECT 'Gallery items:', COUNT(*) FROM gallery;
SELECT 'Package items:', COUNT(*) FROM packages;
SELECT 'Event items:', COUNT(*) FROM events;