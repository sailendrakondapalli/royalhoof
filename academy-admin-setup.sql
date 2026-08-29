-- ============================================
-- ACADEMY ADMIN PANEL DATABASE SETUP
-- Complete setup for Gallery, Events, Packages, Testimonials, FAQs, Enquiries
-- ============================================

-- 1. GALLERY TABLE
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  category TEXT NOT NULL,
  capacity INTEGER DEFAULT 0,
  registered_count INTEGER DEFAULT 0,
  image_url TEXT,
  status TEXT CHECK (status IN ('upcoming', 'past', 'cancelled')) DEFAULT 'upcoming',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PACKAGES TABLE
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration TEXT NOT NULL, -- 'month', 'quarter', '6 months', 'year'
  package_type TEXT CHECK (package_type IN ('adult', 'kids')) DEFAULT 'adult',
  age_group TEXT, -- For kids packages
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  review TEXT NOT NULL,
  image_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FAQS TABLE
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  enquiry_type TEXT CHECK (enquiry_type IN ('general', 'demo', 'package', 'event')) DEFAULT 'general',
  message TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  related_id UUID, -- Can reference package_id or event_id
  status TEXT CHECK (status IN ('new', 'contacted', 'converted', 'closed')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  status TEXT CHECK (status IN ('registered', 'confirmed', 'cancelled')) DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(package_type);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries(enquiry_type);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Public read access for active items
CREATE POLICY "Public can view active gallery" ON gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active packages" ON packages FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view approved testimonials" ON testimonials FOR SELECT USING (is_approved = true AND is_active = true);
CREATE POLICY "Public can view active FAQs" ON faqs FOR SELECT USING (is_active = true);

-- Public can create enquiries and registrations
CREATE POLICY "Public can create enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create event registrations" ON event_registrations FOR INSERT WITH CHECK (true);

-- Admin full access (assuming you have a function to check admin role)
CREATE POLICY "Admins have full access to gallery" ON gallery FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins have full access to events" ON events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins have full access to packages" ON packages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins have full access to testimonials" ON testimonials FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins have full access to FAQs" ON faqs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can view all enquiries" ON enquiries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can update enquiries" ON enquiries FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can view event registrations" ON event_registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Sample Gallery Items
INSERT INTO gallery (title, description, media_url, media_type, category, display_order) VALUES
('Summer Training 2024', 'Intensive summer training sessions', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80', 'image', 'Training', 1),
('Championship Winners', 'Our champions from 2023', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', 'image', 'Events', 2),
('Facility Tour', 'Virtual tour of our facilities', '/herovideo.mp4', 'video', 'Facilities', 3);

-- Sample Events
INSERT INTO events (title, description, event_date, event_time, location, category, capacity, image_url) VALUES
('Summer Championship 2024', 'Annual championship with exciting prizes', '2024-06-15', '9:00 AM', 'Main Arena', 'Competition', 100, 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80'),
('Beginner Workshop', 'Free workshop for beginners', '2024-06-10', '5:00 PM', 'Training Hall A', 'Workshop', 30, 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80');

-- Sample Packages
INSERT INTO packages (name, description, price, duration, package_type, features, is_popular, display_order) VALUES
('Basic', 'Perfect for beginners', 2999, 'month', 'adult', '["Access to group training", "4 sessions per week", "Locker facility"]', false, 1),
('Premium', 'Our most popular package', 7999, 'quarter', 'adult', '["Unlimited sessions", "Personal training", "Nutrition consultation", "Free kit"]', true, 2),
('Elite', 'Complete premium experience', 14999, '6 months', 'adult', '["Dedicated coach", "Weekly personal training", "Customized plan", "Competition prep"]', false, 3);

-- Sample Testimonials
INSERT INTO testimonials (name, role, rating, review, is_approved, display_order) VALUES
('Rajesh Kumar', 'Member since 2022', 5, 'Excellent training facilities and professional instructors. Highly recommended!', true, 1),
('Priya Sharma', 'Premium Member', 5, 'The academy provides world-class coaching. Very satisfied!', true, 2);

-- Sample FAQs
INSERT INTO faqs (category, question, answer, display_order) VALUES
('General', 'What are your operating hours?', 'We are open Monday to Sunday from 6:00 AM to 9:00 PM.', 1),
('General', 'Do you offer a free trial?', 'Yes! We offer a complimentary demo session for all new members.', 2),
('Membership', 'What packages do you offer?', 'We offer monthly, quarterly, half-yearly, and annual memberships.', 3),
('Payment', 'What payment methods do you accept?', 'We accept cash, UPI, debit/credit cards, and bank transfers.', 4);

-- ============================================
-- FUNCTIONS FOR ADMIN OPERATIONS
-- ============================================

-- Function to update event registered count
CREATE OR REPLACE FUNCTION update_event_registered_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET registered_count = registered_count + 1 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET registered_count = GREATEST(0, registered_count - 1) 
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for event registration count
DROP TRIGGER IF EXISTS trigger_update_event_count ON event_registrations;
CREATE TRIGGER trigger_update_event_count
AFTER INSERT OR DELETE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION update_event_registered_count();

-- Function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
DROP TRIGGER IF EXISTS update_gallery_updated_at ON gallery;
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Academy Admin Panel Database Setup Complete!';
  RAISE NOTICE 'Tables created: gallery, events, packages, testimonials, faqs, enquiries, event_registrations';
  RAISE NOTICE 'RLS policies configured for public read and admin full access';
  RAISE NOTICE 'Sample data inserted for testing';
END $$;
