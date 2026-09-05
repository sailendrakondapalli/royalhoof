-- ============================================================
--  CLEAR ALL PRODUCTS (and dependent data)
--  Run this in Supabase SQL Editor to wipe all products,
--  cart items, wishlist, and order item references.
--  Orders themselves are preserved (product_id set to NULL).
-- ============================================================

-- 1. Clear cart and wishlist (they reference products)
DELETE FROM cart;
DELETE FROM wishlist;

-- 2. Nullify product references in order_items (preserves order history)
UPDATE order_items SET product_id = NULL;

-- 3. Delete all products
DELETE FROM products;

-- 4. Reset custom ID sequences if any
-- (Nothing to reset — custom_id is admin-assigned text, not a sequence)

SELECT 'All products cleared. You can now add fresh Rudraksha products via Admin Panel.' AS status;
