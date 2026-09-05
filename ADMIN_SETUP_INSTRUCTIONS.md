# Admin Panel Setup Instructions

## Current Status ✅
- **Admin Navigation**: Gallery, Events, and Packages buttons are properly configured in the admin sidebar
- **Public Pages**: Updated to fetch data from database with fallback to sample data
- **Admin Pages**: AdminGallery.jsx, AdminPackages.jsx, and AdminEvents.jsx already exist
- **Routing**: All admin routes are properly configured

## Required Setup Steps

### 1. Database Setup (REQUIRED)
You need to run the SQL setup script to create the necessary database tables:

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run the contents of `academy-admin-setup.sql`

This will create these tables:
- `gallery` - For storing images and videos
- `events` - For managing events and registrations  
- `packages` - For membership packages
- `testimonials` - For customer reviews
- `faqs` - For frequently asked questions
- `enquiries` - For contact form submissions

### 2. Access Admin Panel
1. Visit `/admin` on your website
2. Login with admin credentials
3. Use the sidebar to navigate to:
   - **Gallery** - Add/edit images and videos
   - **Events** - Manage upcoming events
   - **Packages** - Create membership packages

### 3. How to Add Content

#### Gallery Images/Videos:
1. Go to `/admin/gallery`
2. Click "Add New" 
3. Upload image/video and set category
4. Content will immediately appear on `/gallery` page

#### Events:
1. Go to `/admin/events`
2. Create new events with dates, locations, capacity
3. Events will appear on `/events` page

#### Packages:
1. Go to `/admin/packages` 
2. Create adult or kids packages
3. Set prices, features, and mark popular packages
4. Packages will appear on `/packages` page

### 4. Public Pages
The following pages now automatically fetch from database:
- `/gallery` - Shows all active gallery items
- `/events` - Shows upcoming and past events  
- `/packages` - Shows adult and kids membership packages

If database is not set up, pages will show sample data as fallback.

### 5. Database Policies
The setup includes Row Level Security (RLS) policies:
- **Public**: Can view active content and submit enquiries
- **Admin**: Full access to manage all content

## Next Steps
1. Run `academy-admin-setup.sql` in Supabase
2. Access admin panel and start adding content
3. Test that content appears on public pages
4. Customize admin pages if needed

## Troubleshooting
- If you see 404 errors for tables, the SQL setup hasn't been run
- If content doesn't appear, check RLS policies in Supabase
- If admin panel is not accessible, verify user has admin role

All functionality is now connected and ready to use!