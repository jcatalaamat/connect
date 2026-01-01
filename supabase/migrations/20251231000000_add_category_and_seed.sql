-- Add category field to offerings
-- ============================================

-- Add category column to offerings
ALTER TABLE offerings ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_offerings_category ON offerings(category);

-- Add check constraint for valid categories (matches SPECIALTIES in app)
-- Using DO block to handle if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_category'
  ) THEN
    ALTER TABLE offerings ADD CONSTRAINT valid_category CHECK (
      category IS NULL OR category IN (
        'Yoga', 'Meditation', 'Breathwork', 'Sound Healing', 'Reiki',
        'Massage', 'Cacao Ceremony', 'Temazcal', 'Holistic Therapy', 'Energy Work'
      )
    );
  END IF;
END $$;

-- Note: Seed data for practitioners and offerings should be added via the app
-- after real users sign up, since practitioners require auth.users profiles.
