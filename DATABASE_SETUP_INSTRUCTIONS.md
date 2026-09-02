# Database Setup Instructions

Your database is missing required tables. Follow these steps:

## Steps to Fix:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project (mpmwbxzxkytpqjvsyprb)

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run the Setup Script**
   - Open the file: `FULL_DATABASE_SETUP.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see these tables:
     - products
     - orders
     - order_items
     - cart
     - wishlist
     - addresses
     - reviews
     - site_settings
     - promo_codes
     - stock_history
     - order_series_counter

5. **Verify Storage Buckets**
   - Click "Storage" in left sidebar
   - You should see:
     - product-images
     - payment-screenshots

## If You Already Ran the Script

If you've already run the setup but still getting errors, try:

1. **Check if tables exist but have wrong permissions**
   - In SQL Editor, run:
     ```sql
     SELECT tablename FROM pg_tables WHERE schemaname = 'public';
     ```

2. **If tables don't exist, run FULL_DATABASE_SETUP.sql again**

3. **Clear browser cache and refresh**

## After Setup Complete

1. Refresh your website
2. The errors should be gone
3. You can add products via Admin Panel
