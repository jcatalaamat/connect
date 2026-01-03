-- Seed data for Connect MVP
-- Ties services (sessions) and events to Astral Integration practitioner

-- ============================================
-- PRACTITIONER ID: 7f3a1b89-113f-459d-853b-dd8902b357f9
-- CITY ID (Mallorca): 30b4c1d0-4189-4b35-b865-745be538bed1
-- ============================================

-- ============================================
-- CITY: Mallorca
-- ============================================
UPDATE cities SET
  cover_image_url = 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&q=80',
  description = 'Discover wellness and healing on the beautiful Mediterranean island of Mallorca. From breathwork ceremonies in ancient fincas to sound healing on pristine beaches, connect with practitioners offering transformative experiences amidst stunning natural beauty.'
WHERE slug = 'mallorca';

-- Clear existing offerings, event_dates, availability_slots for this practitioner
DELETE FROM availability_slots WHERE offering_id IN (SELECT id FROM offerings WHERE practitioner_id = '7f3a1b89-113f-459d-853b-dd8902b357f9');
DELETE FROM event_dates WHERE offering_id IN (SELECT id FROM offerings WHERE practitioner_id = '7f3a1b89-113f-459d-853b-dd8902b357f9');
DELETE FROM offerings WHERE practitioner_id = '7f3a1b89-113f-459d-853b-dd8902b357f9';

-- Update practitioner with avatar, cover image, and move to Mallorca
UPDATE practitioners SET
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  cover_image_url = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
  city_id = '30b4c1d0-4189-4b35-b865-745be538bed1'
WHERE id = '7f3a1b89-113f-459d-853b-dd8902b357f9';

-- ============================================
-- OFFERINGS: Sessions (1:1 Services)
-- ============================================

-- Session 1: Breathwork Integration
INSERT INTO offerings (
  id, practitioner_id, type, title, description, price_cents, currency,
  duration_minutes, location_type, location_address, is_active, category, cover_image_url
) VALUES (
  'a1b2c3d4-1111-4000-8000-000000000001',
  '7f3a1b89-113f-459d-853b-dd8902b357f9',
  'session',
  'Breathwork Integration Session',
  'A transformative 90-minute breathwork session combining conscious connected breathing with integration support. Perfect for releasing stored emotions, gaining clarity, and deepening self-awareness.',
  8500,
  'EUR',
  90,
  'in_person',
  'Son Servera, Mallorca',
  true,
  'Breathwork',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'
);

-- Session 2: Holistic Coaching
INSERT INTO offerings (
  id, practitioner_id, type, title, description, price_cents, currency,
  duration_minutes, location_type, location_address, is_active, category, cover_image_url
) VALUES (
  'a1b2c3d4-1111-4000-8000-000000000002',
  '7f3a1b89-113f-459d-853b-dd8902b357f9',
  'session',
  'Holistic Life Coaching',
  'A 60-minute coaching session to help you align your life with your deeper purpose. We explore blocks, patterns, and create actionable steps for transformation.',
  6500,
  'EUR',
  60,
  'in_person',
  'Son Servera, Mallorca',
  true,
  'Holistic Therapy',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80'
);

-- Session 3: Energy Healing
INSERT INTO offerings (
  id, practitioner_id, type, title, description, price_cents, currency,
  duration_minutes, location_type, location_address, is_active, category, cover_image_url
) VALUES (
  'a1b2c3d4-1111-4000-8000-000000000003',
  '7f3a1b89-113f-459d-853b-dd8902b357f9',
  'session',
  'Energy Healing & Reiki',
  'A gentle 75-minute session working with your energy body. Combines Reiki, intuitive healing, and light breathwork to restore balance and vitality.',
  7500,
  'EUR',
  75,
  'in_person',
  'Son Servera, Mallorca',
  true,
  'Reiki',
  'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800&q=80'
);

-- ============================================
-- OFFERINGS: Events
-- ============================================

-- Event 1: Group Breathwork Journey
INSERT INTO offerings (
  id, practitioner_id, type, title, description, price_cents, currency,
  capacity, location_type, location_address, is_active, category, cover_image_url
) VALUES (
  'b2c3d4e5-2222-4000-8000-000000000001',
  '7f3a1b89-113f-459d-853b-dd8902b357f9',
  'event',
  'Group Breathwork Journey',
  'A powerful 2-hour group breathwork ceremony. Connect with a supportive community as we journey together through conscious connected breathing, live music, and integration sharing.',
  4500,
  'EUR',
  15,
  'in_person',
  'Wellness Studio, Son Servera, Mallorca',
  true,
  'Breathwork',
  'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80'
);

-- Event 2: Sound Healing Circle
INSERT INTO offerings (
  id, practitioner_id, type, title, description, price_cents, currency,
  capacity, location_type, location_address, is_active, category, cover_image_url
) VALUES (
  'b2c3d4e5-2222-4000-8000-000000000002',
  '7f3a1b89-113f-459d-853b-dd8902b357f9',
  'event',
  'Sound Healing Circle',
  'Immerse yourself in healing vibrations during this 90-minute sound bath. Crystal bowls, gongs, and ancient instruments guide you into deep relaxation and cellular healing.',
  3500,
  'EUR',
  20,
  'in_person',
  'Beach Venue, Cala Millor, Mallorca',
  true,
  'Sound Healing',
  'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800&q=80'
);

-- Event 3: Sunset Meditation & Cacao
INSERT INTO offerings (
  id, practitioner_id, type, title, description, price_cents, currency,
  capacity, location_type, location_address, is_active, category, cover_image_url
) VALUES (
  'b2c3d4e5-2222-4000-8000-000000000003',
  '7f3a1b89-113f-459d-853b-dd8902b357f9',
  'event',
  'Sunset Meditation & Cacao Ceremony',
  'A magical evening combining ceremonial cacao with guided meditation as the sun sets over the Mediterranean. Includes intention setting, heart-opening cacao, and silent meditation.',
  4000,
  'EUR',
  12,
  'in_person',
  'Private Finca, Artà, Mallorca',
  true,
  'Cacao Ceremony',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
);

-- ============================================
-- AVAILABILITY SLOTS (for sessions) - Next 2 weeks
-- ============================================

-- Breathwork Session slots
INSERT INTO availability_slots (offering_id, start_time, end_time, is_booked) VALUES
  ('a1b2c3d4-1111-4000-8000-000000000001', NOW() + INTERVAL '2 days' + TIME '10:00', NOW() + INTERVAL '2 days' + TIME '11:30', false),
  ('a1b2c3d4-1111-4000-8000-000000000001', NOW() + INTERVAL '2 days' + TIME '14:00', NOW() + INTERVAL '2 days' + TIME '15:30', false),
  ('a1b2c3d4-1111-4000-8000-000000000001', NOW() + INTERVAL '4 days' + TIME '10:00', NOW() + INTERVAL '4 days' + TIME '11:30', false),
  ('a1b2c3d4-1111-4000-8000-000000000001', NOW() + INTERVAL '6 days' + TIME '16:00', NOW() + INTERVAL '6 days' + TIME '17:30', false),
  ('a1b2c3d4-1111-4000-8000-000000000001', NOW() + INTERVAL '9 days' + TIME '10:00', NOW() + INTERVAL '9 days' + TIME '11:30', false);

-- Holistic Coaching slots
INSERT INTO availability_slots (offering_id, start_time, end_time, is_booked) VALUES
  ('a1b2c3d4-1111-4000-8000-000000000002', NOW() + INTERVAL '1 day' + TIME '09:00', NOW() + INTERVAL '1 day' + TIME '10:00', false),
  ('a1b2c3d4-1111-4000-8000-000000000002', NOW() + INTERVAL '1 day' + TIME '11:00', NOW() + INTERVAL '1 day' + TIME '12:00', false),
  ('a1b2c3d4-1111-4000-8000-000000000002', NOW() + INTERVAL '3 days' + TIME '09:00', NOW() + INTERVAL '3 days' + TIME '10:00', false),
  ('a1b2c3d4-1111-4000-8000-000000000002', NOW() + INTERVAL '5 days' + TIME '15:00', NOW() + INTERVAL '5 days' + TIME '16:00', false),
  ('a1b2c3d4-1111-4000-8000-000000000002', NOW() + INTERVAL '8 days' + TIME '09:00', NOW() + INTERVAL '8 days' + TIME '10:00', false),
  ('a1b2c3d4-1111-4000-8000-000000000002', NOW() + INTERVAL '10 days' + TIME '14:00', NOW() + INTERVAL '10 days' + TIME '15:00', false);

-- Energy Healing slots
INSERT INTO availability_slots (offering_id, start_time, end_time, is_booked) VALUES
  ('a1b2c3d4-1111-4000-8000-000000000003', NOW() + INTERVAL '2 days' + TIME '16:00', NOW() + INTERVAL '2 days' + TIME '17:15', false),
  ('a1b2c3d4-1111-4000-8000-000000000003', NOW() + INTERVAL '5 days' + TIME '10:00', NOW() + INTERVAL '5 days' + TIME '11:15', false),
  ('a1b2c3d4-1111-4000-8000-000000000003', NOW() + INTERVAL '7 days' + TIME '16:00', NOW() + INTERVAL '7 days' + TIME '17:15', false),
  ('a1b2c3d4-1111-4000-8000-000000000003', NOW() + INTERVAL '12 days' + TIME '10:00', NOW() + INTERVAL '12 days' + TIME '11:15', false);

-- ============================================
-- EVENT DATES (for events) - Upcoming events
-- ============================================

-- Group Breathwork Journey dates
INSERT INTO event_dates (offering_id, start_time, end_time, spots_remaining) VALUES
  ('b2c3d4e5-2222-4000-8000-000000000001', NOW() + INTERVAL '5 days' + TIME '18:00', NOW() + INTERVAL '5 days' + TIME '20:00', 15),
  ('b2c3d4e5-2222-4000-8000-000000000001', NOW() + INTERVAL '12 days' + TIME '18:00', NOW() + INTERVAL '12 days' + TIME '20:00', 15),
  ('b2c3d4e5-2222-4000-8000-000000000001', NOW() + INTERVAL '19 days' + TIME '18:00', NOW() + INTERVAL '19 days' + TIME '20:00', 15);

-- Sound Healing Circle dates
INSERT INTO event_dates (offering_id, start_time, end_time, spots_remaining) VALUES
  ('b2c3d4e5-2222-4000-8000-000000000002', NOW() + INTERVAL '3 days' + TIME '19:00', NOW() + INTERVAL '3 days' + TIME '20:30', 20),
  ('b2c3d4e5-2222-4000-8000-000000000002', NOW() + INTERVAL '10 days' + TIME '19:00', NOW() + INTERVAL '10 days' + TIME '20:30', 20),
  ('b2c3d4e5-2222-4000-8000-000000000002', NOW() + INTERVAL '17 days' + TIME '19:00', NOW() + INTERVAL '17 days' + TIME '20:30', 20);

-- Sunset Meditation & Cacao dates
INSERT INTO event_dates (offering_id, start_time, end_time, spots_remaining) VALUES
  ('b2c3d4e5-2222-4000-8000-000000000003', NOW() + INTERVAL '7 days' + TIME '17:30', NOW() + INTERVAL '7 days' + TIME '19:30', 12),
  ('b2c3d4e5-2222-4000-8000-000000000003', NOW() + INTERVAL '14 days' + TIME '17:30', NOW() + INTERVAL '14 days' + TIME '19:30', 12),
  ('b2c3d4e5-2222-4000-8000-000000000003', NOW() + INTERVAL '21 days' + TIME '17:30', NOW() + INTERVAL '21 days' + TIME '19:30', 12);
