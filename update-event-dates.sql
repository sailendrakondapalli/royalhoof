-- Update event dates to 2026 (future dates) and set correct status
UPDATE events 
SET 
  event_date = '2026-06-15',
  status = 'upcoming',
  is_active = true
WHERE title = 'Summer Championship 2024';

UPDATE events 
SET 
  event_date = '2026-06-10',
  status = 'upcoming',
  is_active = true
WHERE title = 'Beginner Workshop';

-- Or you can insert new events for 2026
-- Uncomment the lines below if you want to add more events

/*
INSERT INTO events (title, description, event_date, event_time, location, category, capacity, image_url, status, is_active) VALUES
('Royal Hoof Grand Opening', 'Join us for the grand opening celebration of Royal Hoof Horse Riding Academy!', '2026-07-01', '10:00 AM', 'GIRI FARMS, Nallambakkam', 'Special Event', 200, 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80', 'upcoming', true),
('Summer Riding Camp 2026', 'Intensive summer camp for young riders - learn from the best!', '2026-07-15', '9:00 AM', 'Main Arena', 'Camp', 50, 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=80', 'upcoming', true),
('Championship Series', 'Annual championship with exciting prizes and competitions', '2026-08-20', '8:00 AM', 'Competition Ground', 'Competition', 100, 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1200&q=80', 'upcoming', true);
*/
