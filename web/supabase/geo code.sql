-- Geo schema migration: states, counties, cities, neighborhoods
-- Safe to run on empty DB (tables were just deleted) and idempotent on policy creation.

-- STATES
CREATE TABLE IF NOT EXISTS public.states (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  state_code TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COUNTIES
CREATE TABLE IF NOT EXISTS public.counties (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id BIGINT NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL,
  fips TEXT,
  population INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (state_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_counties_state_id ON public.counties(state_id);
CREATE INDEX IF NOT EXISTS idx_counties_fips ON public.counties(fips);

-- CITIES
CREATE TABLE IF NOT EXISTS public.cities (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id BIGINT NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  county_id BIGINT REFERENCES public.counties(id) ON DELETE SET NULL,
  state_code TEXT NOT NULL,
  county_fips TEXT,
  population INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (state_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON public.cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_county_id ON public.cities(county_id);
CREATE INDEX IF NOT EXISTS idx_cities_county_fips ON public.cities(county_fips);

-- NEIGHBORHOODS
CREATE TABLE IF NOT EXISTS public.neighborhoods (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  state_id BIGINT NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  county_id BIGINT REFERENCES public.counties(id) ON DELETE SET NULL,
  city_id BIGINT REFERENCES public.cities(id) ON DELETE SET NULL,
  population INTEGER,
  lat NUMERIC(10,6),
  lon NUMERIC(10,6),
  zips TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (state_id, city_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_state_id ON public.neighborhoods(state_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city_id ON public.neighborhoods(city_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_county_id ON public.neighborhoods(county_id);

-- Enable RLS
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Policies: public read-only; service role full access
DO $$
BEGIN
  -- STATES
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'states' AND policyname = 'Public read states'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read states" ON public.states FOR SELECT TO public USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'states' AND policyname = 'Service role all states'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role all states" ON public.states FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;

  -- COUNTIES
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'counties' AND policyname = 'Public read counties'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read counties" ON public.counties FOR SELECT TO public USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'counties' AND policyname = 'Service role all counties'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role all counties" ON public.counties FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;

  -- CITIES
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cities' AND policyname = 'Public read cities'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read cities" ON public.cities FOR SELECT TO public USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cities' AND policyname = 'Service role all cities'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role all cities" ON public.cities FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;

  -- NEIGHBORHOODS
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'neighborhoods' AND policyname = 'Public read neighborhoods'
  ) THEN
    EXECUTE 'CREATE POLICY "Public read neighborhoods" ON public.neighborhoods FOR SELECT TO public USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'neighborhoods' AND policyname = 'Service role all neighborhoods'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role all neighborhoods" ON public.neighborhoods FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;


/*
  # Security hardening fixes for Supabase linter warnings

  - Public import policies for cities/counties/zip_codes
*/

-- -----------------------------------------------------------------------------
-- Lock down data import policies to service_role (cities/counties/zip_codes)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public insert on cities" ON cities;
DROP POLICY IF EXISTS "Allow public update on cities" ON cities;
DROP POLICY IF EXISTS "Allow public insert on counties" ON counties;
DROP POLICY IF EXISTS "Allow public update on counties" ON counties;
DROP POLICY IF EXISTS "Allow public insert on zip_codes" ON zip_codes;
DROP POLICY IF EXISTS "Allow public update on zip_codes" ON zip_codes;

CREATE POLICY "Service role can insert cities"
  ON cities
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update cities"
  ON cities
  FOR UPDATE
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert counties"
  ON counties
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update counties"
  ON counties
  FOR UPDATE
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert zip_codes"
  ON zip_codes
  FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update zip_codes"
  ON zip_codes
  FOR UPDATE
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

