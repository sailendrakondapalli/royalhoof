-- =====================================================
-- Create Site Settings Table
-- =====================================================
-- This table stores configurable site settings like:
-- - Hero video/image URLs
-- - Offer banners
-- - Promo banners
-- - Features bar configuration
-- - Products per page
-- - Category customization
-- =====================================================

-- Create the site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT        PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated can write site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated can upsert site settings" ON site_settings;

-- Create RLS policies
-- ULTRA-PERMISSIVE for development (anyone can do anything)
-- WARNING: This allows anonymous users to modify settings
-- Tighten security later by requiring authentication
CREATE POLICY "Anyone can manage site settings"
  ON site_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Insert Default Settings
-- =====================================================

-- Hero video URL (empty by default, set via admin panel)
INSERT INTO site_settings (key, value)
VALUES ('hero_video_url', '')
ON CONFLICT (key) DO NOTHING;

-- Hero background image URL (empty by default, set via admin panel)
INSERT INTO site_settings (key, value)
VALUES ('hero_bg_image_url', '')
ON CONFLICT (key) DO NOTHING;

-- Offer banner (empty by default)
INSERT INTO site_settings (key, value)
VALUES ('offer_banner', '')
ON CONFLICT (key) DO NOTHING;

-- Promo banners (empty array by default)
INSERT INTO site_settings (key, value)
VALUES ('promo_banners', '[]')
ON CONFLICT (key) DO NOTHING;

-- Features bar (default features)
INSERT INTO site_settings (key, value)
VALUES ('features_bar', '[{"id":1,"title":"Certified Quality","desc":"Authenticity Guaranteed"},{"id":2,"title":"Fast Shipping","desc":"Across India"},{"id":3,"title":"Easy Returns","desc":"7 Day Return Policy"},{"id":4,"title":"Handcrafted","desc":"Artisan made jewelry"}]')
ON CONFLICT (key) DO NOTHING;

-- Products per page (default to 12)
INSERT INTO site_settings (key, value)
VALUES ('products_per_page', '12')
ON CONFLICT (key) DO NOTHING;

-- Custom categories (empty by default)
INSERT INTO site_settings (key, value)
VALUES ('custom_categories', '[]')
ON CONFLICT (key) DO NOTHING;

-- Site logo URL (empty by default)
INSERT INTO site_settings (key, value)
VALUES ('logo_url', '')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Verification
-- =====================================================

-- Show all settings
SELECT 
  'Current Settings:' as info,
  key,
  CASE 
    WHEN LENGTH(value) > 100 THEN LEFT(value, 100) || '...'
    ELSE value
  END as value_preview,
  updated_at
FROM site_settings
ORDER BY key;

-- Show RLS policies
SELECT 
  'RLS Policies:' as info,
  policyname,
  cmd as operation,
  qual as using_clause
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'site_settings'
ORDER BY policyname;
