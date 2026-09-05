-- ============================================================
--  RUDHRAKSHA STORE — FULL DATABASE SETUP
--  Paste this entire file into Supabase SQL Editor and run.
--  It is safe to run on a fresh database.
--
--  NOTE: No seed products included — add your own via Admin Panel.
--  To clear existing products from an old DB, run:
--    DELETE FROM order_items;
--    DELETE FROM cart;
--    DELETE FROM wishlist;
--    DELETE FROM products;
-- ============================================================


-- ============================================================
-- SECTION 1 — TABLES
-- ============================================================

-- Products
CREATE TABLE IF NOT EXISTS products (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  price           numeric     NOT NULL,
  category        text        NOT NULL,
  description     text,
  images          text[]      DEFAULT '{}',
  tags            text[]      DEFAULT '{}',
  stock           integer     DEFAULT 0,
  size            text        DEFAULT 'Medium',
  custom_id       text        UNIQUE,           -- admin-assigned display ID
  series_id       text        DEFAULT 'NS0',    -- product series
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_custom_id ON products(custom_id);

-- Cart
CREATE TABLE IF NOT EXISTS cart (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id  uuid        REFERENCES products(id)   ON DELETE CASCADE NOT NULL,
  quantity    integer     DEFAULT 1,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id  uuid        REFERENCES products(id)   ON DELETE CASCADE NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_amount            numeric     NOT NULL,
  payment_status          text        DEFAULT 'pending',
  order_status            text        DEFAULT 'confirmed',
  address                 jsonb,
  city                    text,
  state                   text,
  pincode                 text,
  razorpay_payment_id     text,
  razorpay_order_id       text,
  -- UPI payment fields
  payment_method          text        DEFAULT 'upi',
  payment_screenshot_url  text,
  upi_ref                 text,
  payment_verified        boolean     DEFAULT false,
  -- Tracking fields
  tracking_id             text,
  tracking_image_url      text,
  tracking_updated_at     timestamptz,
  -- Order ID display fields
  display_order_id        text,
  order_series            text        DEFAULT 'NS0',
  series_number           integer,
  created_at              timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_display_id ON orders(display_order_id);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        REFERENCES orders(id)   ON DELETE CASCADE NOT NULL,
  product_id  uuid        REFERENCES products(id) ON DELETE SET NULL,  -- SET NULL so products can be deleted without losing order history
  quantity    integer     NOT NULL,
  price       numeric     NOT NULL
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label       text        DEFAULT 'Home',
  full_name   text        NOT NULL,
  phone       text        NOT NULL,
  address1    text        NOT NULL,
  address2    text,
  city        text        NOT NULL,
  state       text        NOT NULL,
  pincode     text        NOT NULL,
  is_default  boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name   text,
  user_avatar text,
  rating      integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Site Settings (hero video, banners, features bar, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  key         text        PRIMARY KEY,
  value       text,
  updated_at  timestamptz DEFAULT now()
);

-- Stock History (audit log)
CREATE TABLE IF NOT EXISTS stock_history (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        REFERENCES products(id) ON DELETE CASCADE,
  old_stock   integer,
  new_stock   integer,
  changed_by  uuid        REFERENCES auth.users(id),
  reason      text,
  created_at  timestamptz DEFAULT now()
);

-- Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 text        NOT NULL UNIQUE,
  description          text,
  discount_type        text        NOT NULL DEFAULT 'percentage',  -- 'percentage' | 'flat'
  discount_value       numeric     NOT NULL,
  min_order_amount     numeric     DEFAULT 0,
  applicable_category  text        DEFAULT NULL,  -- NULL = all categories
  is_one_time          boolean     DEFAULT false,
  is_active            boolean     DEFAULT true,
  expires_at           timestamptz DEFAULT NULL,
  created_at           timestamptz DEFAULT now()
);

-- Promo Code Uses (track per-user usage)
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id   uuid        REFERENCES promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id   uuid        REFERENCES auth.users(id)  ON DELETE CASCADE NOT NULL,
  order_id  uuid        DEFAULT NULL,
  used_at   timestamptz DEFAULT now(),
  UNIQUE(code_id, user_id)
);

-- Order Series Counter (for sequential order IDs)
CREATE TABLE IF NOT EXISTS order_series_counter (
  series      text    PRIMARY KEY,
  last_number integer DEFAULT 0
);

INSERT INTO order_series_counter (series, last_number)
VALUES ('NS0', 0), ('NS1', 0)
ON CONFLICT (series) DO NOTHING;


-- ============================================================
-- SECTION 2 — ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart                ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_series_counter ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 3 — DROP ALL EXISTING POLICIES (clean slate)
-- ============================================================

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE tablename IN (
      'products','cart','wishlist','orders','order_items',
      'addresses','reviews','site_settings','stock_history',
      'promo_codes','promo_code_uses','order_series_counter'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Also clean up storage policies for our buckets
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND (policyname ILIKE '%product%' OR policyname ILIKE '%payment%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;


-- ============================================================
-- SECTION 4 — RLS POLICIES
-- ============================================================

-- ── Products ────────────────────────────────────────────────
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert products"
  ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update products"
  ON products FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete products"
  ON products FOR DELETE USING (auth.role() = 'authenticated');

-- ── Cart ─────────────────────────────────────────────────────
CREATE POLICY "Users manage own cart select"
  ON cart FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cart insert"
  ON cart FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own cart update"
  ON cart FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cart delete"
  ON cart FOR DELETE USING (auth.uid() = user_id);

-- ── Wishlist ─────────────────────────────────────────────────
CREATE POLICY "Users manage own wishlist select"
  ON wishlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlist insert"
  ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlist delete"
  ON wishlist FOR DELETE USING (auth.uid() = user_id);

-- ── Orders ───────────────────────────────────────────────────
CREATE POLICY "Users manage own orders select"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own orders insert"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own orders update"
  ON orders FOR UPDATE USING (auth.uid() = user_id);

-- ── Order Items ───────────────────────────────────────────────
CREATE POLICY "Users view own order items"
  ON order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own order items"
  ON order_items FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ── Addresses ────────────────────────────────────────────────
CREATE POLICY "Users manage own addresses select"
  ON addresses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users manage own addresses insert"
  ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own addresses update"
  ON addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own addresses delete"
  ON addresses FOR DELETE USING (auth.uid() = user_id);

-- ── Reviews ──────────────────────────────────────────────────
CREATE POLICY "Reviews are public"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users insert own review"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own review"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own review"
  ON reviews FOR DELETE USING (auth.uid() = user_id);

-- ── Site Settings ─────────────────────────────────────────────
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Authenticated can upsert site settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── Stock History ─────────────────────────────────────────────
CREATE POLICY "Authenticated can manage stock history"
  ON stock_history FOR ALL USING (auth.role() = 'authenticated');

-- ── Promo Codes ───────────────────────────────────────────────
CREATE POLICY "Public can read active promo codes"
  ON promo_codes FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage promo codes"
  ON promo_codes FOR ALL
  USING (auth.role() = 'authenticated');

-- ── Promo Code Uses ───────────────────────────────────────────
CREATE POLICY "Users read own promo uses"
  ON promo_code_uses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own promo uses"
  ON promo_code_uses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all promo uses"
  ON promo_code_uses FOR SELECT USING (auth.role() = 'authenticated');

-- ── Order Series Counter ──────────────────────────────────────
CREATE POLICY "Anyone can read series counter"
  ON order_series_counter FOR SELECT USING (true);

CREATE POLICY "Authenticated can update series counter"
  ON order_series_counter FOR UPDATE USING (auth.role() = 'authenticated');


-- ============================================================
-- SECTION 5 — SECURITY DEFINER FUNCTIONS (Admin bypass RLS)
-- ============================================================

-- Get all orders (admin use)
CREATE OR REPLACE FUNCTION get_all_orders()
RETURNS SETOF orders
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM orders ORDER BY created_at DESC;
$$;

-- Get all order items (admin use)
CREATE OR REPLACE FUNCTION get_all_order_items()
RETURNS SETOF order_items
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM order_items;
$$;

-- Update order status (admin use)
CREATE OR REPLACE FUNCTION update_order_status(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE orders SET order_status = p_status WHERE id = p_order_id;
$$;

-- Update order payment (admin use)
CREATE OR REPLACE FUNCTION update_order_payment(
  p_order_id        uuid,
  p_payment_status  text,
  p_payment_verified boolean,
  p_order_status    text
)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE orders
  SET payment_status    = p_payment_status,
      payment_verified  = p_payment_verified,
      order_status      = p_order_status
  WHERE id = p_order_id;
$$;

-- Admin: update order_status directly
CREATE OR REPLACE FUNCTION admin_update_order_status(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE orders SET order_status = p_status WHERE id = p_order_id;
END;
$$;

-- Admin: verify payment
CREATE OR REPLACE FUNCTION admin_verify_payment(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE orders
  SET payment_status = 'paid', payment_verified = true, order_status = 'confirmed'
  WHERE id = p_order_id;
END;
$$;

-- Admin: reject payment
CREATE OR REPLACE FUNCTION admin_reject_payment(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE orders
  SET payment_status = 'failed', order_status = 'cancelled'
  WHERE id = p_order_id;
END;
$$;

-- Get next series number (atomic increment)
CREATE OR REPLACE FUNCTION get_next_series_number(p_series text)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE next_num integer;
BEGIN
  UPDATE order_series_counter
  SET last_number = last_number + 1
  WHERE series = p_series
  RETURNING last_number INTO next_num;
  RETURN next_num;
END;
$$;

-- Get all cart items with product details (admin use)
CREATE OR REPLACE FUNCTION get_all_carts()
RETURNS TABLE (
  id               uuid,
  user_id          uuid,
  product_id       uuid,
  quantity         integer,
  created_at       timestamptz,
  product_name     text,
  product_price    numeric,
  product_images   text[],
  product_category text,
  product_custom_id text
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.user_id, c.product_id, c.quantity, c.created_at,
         p.name, p.price, p.images, p.category, p.custom_id
  FROM cart c
  LEFT JOIN products p ON p.id = c.product_id;
$$;

-- Get all wishlist items with product details (admin use)
CREATE OR REPLACE FUNCTION get_all_wishlists()
RETURNS TABLE (
  id               uuid,
  user_id          uuid,
  product_id       uuid,
  created_at       timestamptz,
  product_name     text,
  product_price    numeric,
  product_images   text[],
  product_category text,
  product_custom_id text
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT w.id, w.user_id, w.product_id, w.created_at,
         p.name, p.price, p.images, p.category, p.custom_id
  FROM wishlist w
  LEFT JOIN products p ON p.id = w.product_id;
$$;

-- Auto-reduce stock after order item is inserted
CREATE OR REPLACE FUNCTION reduce_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id AND stock >= NEW.quantity;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_order_item_insert ON order_items;
CREATE TRIGGER after_order_item_insert
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION reduce_stock_on_order();


-- ============================================================
-- SECTION 6 — GRANT FUNCTION PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION get_all_orders()                                          TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_order_items()                                     TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_status(uuid, text)                           TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_payment(uuid, text, boolean, text)           TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_order_status(uuid, text)                     TO authenticated;
GRANT EXECUTE ON FUNCTION admin_verify_payment(uuid)                                TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reject_payment(uuid)                                TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_series_number(text)                              TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_carts()                                           TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_wishlists()                                       TO authenticated;


-- ============================================================
-- SECTION 7 — STORAGE BUCKETS & POLICIES
-- ============================================================

-- Product images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/quicktime','video/webm'])
ON CONFLICT (id) DO UPDATE SET
  public           = true,
  file_size_limit  = 5242880;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Payment screenshots bucket (private — authenticated only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-screenshots', 'payment-screenshots', false, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/heic'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = 10485760;

CREATE POLICY "Authenticated upload payment screenshot"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated read payment screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');


-- ============================================================
-- SECTION 8 — DEFAULT SITE SETTINGS
-- ============================================================

INSERT INTO site_settings (key, value)
VALUES
  ('hero_video_url',   ''),
  ('offer_banner',     ''),
  ('promo_banners',    ''),
  ('products_per_page','12'),
  ('features_bar', '[
    {"id":1,"title":"Lab Certified","desc":"100% Authentic Rudraksha"},
    {"id":2,"title":"Fast Shipping","desc":"Across India"},
    {"id":3,"title":"Easy Returns","desc":"7 Day Return Policy"},
    {"id":4,"title":"Nepal & Java","desc":"Original Source Beads"}
  ]')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- SECTION 9 — HOW TO SET AN ADMIN USER
-- ============================================================
-- Run this manually for each admin email (replace the email):
--
--   UPDATE auth.users
--   SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
--   WHERE email = 'youradmin@email.com';
--
-- The app also checks VITE_ADMIN_EMAIL in .env for admin access.


-- ============================================================
-- DONE — Your Rudhraksha Store database is ready!
-- ============================================================
