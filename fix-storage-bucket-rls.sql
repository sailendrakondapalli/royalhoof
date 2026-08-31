-- =====================================================
-- Fix Storage Bucket RLS for Product Images
-- =====================================================
-- This fixes the "new row violates row-level security policy" error
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop ALL existing conflicting policies on storage.objects
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Step 2: Create PERMISSIVE policies (allow both authenticated AND anon)

-- Allow ANYONE (including anon) to read
CREATE POLICY "Anyone can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow ANYONE (including anon) to insert
CREATE POLICY "Anyone can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Allow ANYONE (including anon) to update
CREATE POLICY "Anyone can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

-- Allow ANYONE (including anon) to delete
CREATE POLICY "Anyone can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- Step 3: Verify the bucket exists and is configured correctly
-- This will NOT fail if bucket already exists
DO $$
BEGIN
  -- Update existing bucket or do nothing
  UPDATE storage.buckets 
  SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'video/x-msvideo',
      'video/x-matroska'
    ]
  WHERE id = 'product-images';
  
  -- If no rows updated, bucket doesn't exist yet
  IF NOT FOUND THEN
    RAISE NOTICE 'Bucket does not exist. Create it via Dashboard: Storage > New Bucket > name: product-images, public: ON';
  ELSE
    RAISE NOTICE 'Bucket updated successfully!';
  END IF;
END $$;

-- Step 4: Verification query
SELECT 
  'Bucket Configuration:' as info,
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-images';

SELECT 
  'Storage Policies:' as info,
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname ILIKE '%product%'
ORDER BY policyname;
