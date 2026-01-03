-- City requests table for users to request new cities
CREATE TABLE city_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for status filtering
CREATE INDEX city_requests_status_idx ON city_requests(status);
CREATE INDEX city_requests_created_at_idx ON city_requests(created_at DESC);

-- RLS policies
ALTER TABLE city_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a request (logged in or not)
CREATE POLICY "Anyone can create city requests"
  ON city_requests FOR INSERT
  WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON city_requests FOR SELECT
  USING (profile_id = auth.uid() OR profile_id IS NULL);

-- City admins can view all requests (we'll check this in the API)
CREATE POLICY "Admins can view all requests"
  ON city_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM city_admins
      WHERE city_admins.profile_id = auth.uid()
    )
  );

-- City admins can update requests
CREATE POLICY "Admins can update requests"
  ON city_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM city_admins
      WHERE city_admins.profile_id = auth.uid()
    )
  );
