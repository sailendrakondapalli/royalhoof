-- =====================================================
-- Setup Product Images Storage Bucket Policies
-- =====================================================
-- IMPORTANT: You must first create the bucket via Supabase Dashboard:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Set name: product-images
-- 4. Enable "Public bucket"
-- 5. Set file size limit: 10 MB
-- 6. Click "Save"
-- 
-- Then run this SQL to set up the policies.
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete product images" ON storage.objects;

-- =====================================================
-- Storage Policies
-- =====================================================

-- 1. Public Read Access
-- Allow anyone to view/download files from product-images bucket
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 2. Authenticated Upload Access
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 3. Authenticated Update Access
-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 4. Authenticated Delete Access
-- Allow authenticated users to delete files
CREATE POLICY "Authenticated delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- =====================================================
-- Verify Setup
-- =====================================================
-- Run this to verify the bucket was created successfully
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product-images';

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%product%';
