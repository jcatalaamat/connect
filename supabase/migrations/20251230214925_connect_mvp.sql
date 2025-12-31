-- Connect MVP Database Schema
-- Stripe-powered local booking app for wellness practitioners

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE offering_type AS ENUM ('session', 'event');

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'refunded',
  'completed',
  'no_show'
);

CREATE TYPE practitioner_status AS ENUM (
  'pending',
  'approved',
  'suspended',
  'rejected'
);

-- ============================================
-- CITIES TABLE
-- ============================================

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  platform_fee_percent DECIMAL(5,2) DEFAULT 10.00 CHECK (platform_fee_percent >= 5 AND platform_fee_percent <= 15),
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_active ON cities(is_active);

-- ============================================
-- PRACTITIONERS TABLE
-- ============================================

CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id),

  -- Business info
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',

  -- Stripe Connect
  stripe_account_id VARCHAR(255),
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  stripe_charges_enabled BOOLEAN DEFAULT false,
  stripe_payouts_enabled BOOLEAN DEFAULT false,

  -- Status
  status practitioner_status DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,

  -- Contact (public display)
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  website_url TEXT,
  instagram_handle VARCHAR(100),

  -- Media
  avatar_url TEXT,
  cover_image_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(city_id, slug)
);

CREATE INDEX idx_practitioners_city ON practitioners(city_id);
CREATE INDEX idx_practitioners_status ON practitioners(status);
CREATE INDEX idx_practitioners_profile ON practitioners(profile_id);
CREATE INDEX idx_practitioners_stripe ON practitioners(stripe_account_id);

-- ============================================
-- CITY ADMINS TABLE
-- ============================================

CREATE TABLE city_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(profile_id, city_id)
);

CREATE INDEX idx_city_admins_profile ON city_admins(profile_id);
CREATE INDEX idx_city_admins_city ON city_admins(city_id);

-- ============================================
-- OFFERINGS TABLE
-- ============================================

CREATE TABLE offerings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,

  -- Core
  type offering_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Pricing (stored in cents for precision)
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  deposit_required BOOLEAN DEFAULT false,
  deposit_percent INTEGER DEFAULT 0 CHECK (deposit_percent >= 0 AND deposit_percent <= 100),

  -- For sessions: duration in minutes
  duration_minutes INTEGER CHECK (duration_minutes > 0),

  -- For events: capacity
  capacity INTEGER CHECK (capacity > 0),

  -- Location
  location_type VARCHAR(50) DEFAULT 'in_person',
  location_address TEXT,
  location_notes TEXT,
  virtual_link TEXT,

  -- Media
  cover_image_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints based on type
  CONSTRAINT valid_session CHECK (
    type != 'session' OR duration_minutes IS NOT NULL
  ),
  CONSTRAINT valid_event CHECK (
    type != 'event' OR capacity IS NOT NULL
  )
);

CREATE INDEX idx_offerings_practitioner ON offerings(practitioner_id);
CREATE INDEX idx_offerings_type ON offerings(type);
CREATE INDEX idx_offerings_active ON offerings(is_active);

-- ============================================
-- AVAILABILITY SLOTS (for 1:1 Sessions)
-- ============================================

CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,

  -- Time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Status
  is_booked BOOLEAN DEFAULT false,
  booking_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_availability_offering ON availability_slots(offering_id);
CREATE INDEX idx_availability_start ON availability_slots(start_time);
CREATE INDEX idx_availability_booked ON availability_slots(is_booked);
CREATE INDEX idx_availability_available ON availability_slots(offering_id, is_booked) WHERE is_booked = false;

-- ============================================
-- EVENT DATES (for Events/Ceremonies)
-- ============================================

CREATE TABLE event_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offering_id UUID NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,

  -- Time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Capacity management
  capacity_override INTEGER,
  spots_remaining INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_event_time CHECK (end_time > start_time),
  CONSTRAINT valid_spots CHECK (spots_remaining >= 0)
);

CREATE INDEX idx_event_dates_offering ON event_dates(offering_id);
CREATE INDEX idx_event_dates_start ON event_dates(start_time);
CREATE INDEX idx_event_dates_available ON event_dates(offering_id) WHERE spots_remaining > 0;

-- ============================================
-- BOOKINGS TABLE
-- ============================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What was booked
  offering_id UUID NOT NULL REFERENCES offerings(id),
  availability_slot_id UUID REFERENCES availability_slots(id),
  event_date_id UUID REFERENCES event_dates(id),

  -- Who booked (no account required)
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),

  -- Booking details
  status booking_status DEFAULT 'pending',
  spots_booked INTEGER DEFAULT 1 CHECK (spots_booked > 0),

  -- Payment (stored in cents)
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  platform_fee_cents INTEGER NOT NULL CHECK (platform_fee_cents >= 0),
  practitioner_amount_cents INTEGER NOT NULL CHECK (practitioner_amount_cents >= 0),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Stripe references
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  stripe_transfer_id VARCHAR(255),

  -- Confirmation
  confirmation_code VARCHAR(20) NOT NULL UNIQUE,
  confirmation_sent_at TIMESTAMPTZ,

  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by VARCHAR(50),
  cancellation_reason TEXT,
  refund_amount_cents INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Must have either slot or event date (or neither for legacy)
  CONSTRAINT valid_booking_type CHECK (
    (availability_slot_id IS NULL AND event_date_id IS NOT NULL) OR
    (availability_slot_id IS NOT NULL AND event_date_id IS NULL)
  )
);

CREATE INDEX idx_bookings_offering ON bookings(offering_id);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_code);
CREATE INDEX idx_bookings_stripe_pi ON bookings(stripe_payment_intent_id);
CREATE INDEX idx_bookings_slot ON bookings(availability_slot_id);
CREATE INDEX idx_bookings_event_date ON bookings(event_date_id);

-- ============================================
-- TRANSACTIONS TABLE (Audit Log)
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),

  -- Type
  type VARCHAR(50) NOT NULL,

  -- Amounts (in cents)
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Stripe references
  stripe_object_id VARCHAR(255),
  stripe_object_type VARCHAR(50),

  -- Status
  status VARCHAR(50) NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_stripe ON transactions(stripe_object_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practitioners_updated_at
  BEFORE UPDATE ON practitioners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offerings_updated_at
  BEFORE UPDATE ON offerings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Cities: Public read, admin write
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are publicly readable"
  ON cities FOR SELECT
  USING (true);

CREATE POLICY "City admins can update their city"
  ON cities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM city_admins
      WHERE city_admins.city_id = cities.id
      AND city_admins.profile_id = auth.uid()
    )
  );

-- Practitioners: Public read approved, owner manage
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved practitioners are publicly readable"
  ON practitioners FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Practitioners can view their own profile"
  ON practitioners FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "City admins can view all practitioners in their city"
  ON practitioners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM city_admins
      WHERE city_admins.city_id = practitioners.city_id
      AND city_admins.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own practitioner profile"
  ON practitioners FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Practitioners can update their own profile"
  ON practitioners FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "City admins can update practitioners in their city"
  ON practitioners FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM city_admins
      WHERE city_admins.city_id = practitioners.city_id
      AND city_admins.profile_id = auth.uid()
    )
  );

-- City Admins: Only super admins or self can view
ALTER TABLE city_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "City admins can view their own record"
  ON city_admins FOR SELECT
  USING (profile_id = auth.uid());

-- Offerings: Public read active from approved practitioners, owner manage
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active offerings from approved practitioners are readable"
  ON offerings FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM practitioners
      WHERE practitioners.id = offerings.practitioner_id
      AND practitioners.status = 'approved'
    )
  );

CREATE POLICY "Practitioners can view their own offerings"
  ON offerings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM practitioners
      WHERE practitioners.id = offerings.practitioner_id
      AND practitioners.profile_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can manage their own offerings"
  ON offerings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM practitioners
      WHERE practitioners.id = offerings.practitioner_id
      AND practitioners.profile_id = auth.uid()
    )
  );

-- Availability Slots: Public read available, practitioner manage
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Available slots are publicly readable"
  ON availability_slots FOR SELECT
  USING (
    is_booked = false
    AND EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = availability_slots.offering_id
      AND o.is_active = true
      AND p.status = 'approved'
    )
  );

CREATE POLICY "Practitioners can view all their slots"
  ON availability_slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = availability_slots.offering_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can manage their slots"
  ON availability_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = availability_slots.offering_id
      AND p.profile_id = auth.uid()
    )
  );

-- Event Dates: Public read with spots, practitioner manage
ALTER TABLE event_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event dates with spots are publicly readable"
  ON event_dates FOR SELECT
  USING (
    spots_remaining > 0
    AND EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = event_dates.offering_id
      AND o.is_active = true
      AND p.status = 'approved'
    )
  );

CREATE POLICY "Practitioners can view all their event dates"
  ON event_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = event_dates.offering_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can manage their event dates"
  ON event_dates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = event_dates.offering_id
      AND p.profile_id = auth.uid()
    )
  );

-- Bookings: Practitioner can view their bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view bookings for their offerings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = bookings.offering_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can update bookings for their offerings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE o.id = bookings.offering_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "City admins can view bookings in their city"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM offerings o
      JOIN practitioners p ON p.id = o.practitioner_id
      JOIN city_admins ca ON ca.city_id = p.city_id
      WHERE o.id = bookings.offering_id
      AND ca.profile_id = auth.uid()
    )
  );

-- Note: Booking creation is done via API with service role (no RLS)
-- Customer lookup is done via API by confirmation_code + email

-- Transactions: Read only for practitioners and admins
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view transactions for their bookings"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN offerings o ON o.id = b.offering_id
      JOIN practitioners p ON p.id = o.practitioner_id
      WHERE b.id = transactions.booking_id
      AND p.profile_id = auth.uid()
    )
  );

-- ============================================
-- SEED DATA: Cities
-- ============================================

INSERT INTO cities (name, slug, country, timezone, platform_fee_percent, description) VALUES
  ('Mallorca', 'mallorca', 'Spain', 'Europe/Madrid', 10.00, 'Wellness retreats and healing experiences in beautiful Mallorca'),
  ('Mazunte', 'mazunte', 'Mexico', 'America/Mexico_City', 10.00, 'Traditional ceremonies and holistic practices on the Oaxacan coast');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'CONN-';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Check if user is city admin
CREATE OR REPLACE FUNCTION is_city_admin(user_id UUID, check_city_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM city_admins
    WHERE profile_id = user_id AND city_id = check_city_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get practitioner by profile
CREATE OR REPLACE FUNCTION get_practitioner_by_profile(user_id UUID)
RETURNS UUID AS $$
DECLARE
  practitioner_id UUID;
BEGIN
  SELECT id INTO practitioner_id
  FROM practitioners
  WHERE profile_id = user_id
  LIMIT 1;
  RETURN practitioner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
