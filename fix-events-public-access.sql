-- Fix public access to events table
-- This ensures anonymous users can view events on the website

-- First, check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'events';

-- Drop the restrictive policy that only shows active events
DROP POLICY IF EXISTS "Public can view active events" ON events;

-- Create a new policy that allows anyone to read all events
-- (The frontend will filter by is_active)
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'events';
