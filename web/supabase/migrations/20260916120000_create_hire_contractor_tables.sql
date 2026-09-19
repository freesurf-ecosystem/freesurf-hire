-- FreeSurf Hire - contractor tables
-- Namespaced with the `hire_` prefix so they are easy to identify in the shared database.
--
-- THREE tables:
--   1. hire_contractor_profiles   - identity + services + service area + trust
--   2. hire_contractor_reviews    - first-party reviews (user-authored rows)
--   3. hire_contractor_requests   - client -> contractor requests
--
-- Services and service area used to live in their own tables
-- (hire_contractor_services / hire_contractor_service_areas) and were folded
-- into array columns here. Reasons:
--   * the public search went services -> areas -> profiles (3 round trips);
--     with arrays it is one indexed query (`service_slugs @> ...`)
--   * arrays simplify RLS - the owner policy on profiles covers everything
--   * per-area metadata (label) was derivable from the taxonomy anyway
-- Reviews stay a table because they are user-authored rows needing per-row
-- ownership, moderation, and RLS. Requests stay a table because they have a
-- different lifecycle and different RLS (anyone inserts, contractor reads).
-- Google reviews stay as cached jsonb on the profile - third-party data with no
-- per-row ownership.
--
-- ⚠️  This file DROPS and recreates all of these tables. That is safe today
--     because they are new and empty. Once real data exists, future changes
--     must be additive (alter table ... add column) instead.

drop table if exists public.hire_contractor_requests cascade;
drop table if exists public.hire_contractor_reviews cascade;
drop table if exists public.hire_contractor_service_areas cascade;
drop table if exists public.hire_contractor_services cascade;
drop table if exists public.hire_contractor_profiles cascade;
drop function if exists public.hire_is_public_contractor(uuid);

-- ── Contractor profiles ────────────────────────────────────────────────────────
-- Column set extrapolated from the legacy `investors` table so the contractor model
-- carries the same shape (mapping in comments):
--   investors.name/company/email/phone/bio/avatar/website -> identity block
--   investors.specialties / property_types_interested     -> service_slugs
--   investors.locations / property_state_preferences /
--     base_zip_code                                       -> service_zips/cities/states (+ base_zip_code)
--   investors.investment_types                            -> engagement_types
--   investors.minimum_deal_size / maximum_deal_size       -> min_project_size / max_project_size
--   investors.lead_price                                  -> hourly_rate (no lead fees on FreeSurf)
--   investors.rating / review_count / google_*            -> rating / review_count / google_*
--   investors.is_active / admin_paused                    -> is_active / admin_paused
--   investors.crm_system / total_leads                    -> crm_system / total_requests
--   investors.terms_consent_date / tcpa_consent /
--     consent_disclosure_version                          -> same names
--   (lead_price, balance_due, auto_paused_*, stripe_*, subscription_status: intentionally omitted - no fees/subscriptions)
create table if not exists public.hire_contractor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- identity (public fields only - contact details and the full legal name live
  -- in hire_contractor_private). display_name is the ONLY name shown publicly,
  -- and is derived from name_display: the company name, or "Jane D." for a
  -- personal profile. Keeping first_name/last_name out of this table is what
  -- makes the "first name + last initial" option real rather than cosmetic.
  display_name text,
  contact_name text,
  company text,
  name_display text not null default 'personal'
    check (name_display in ('business', 'personal')),
  -- display preference only: whether to offer a "show phone number" button.
  -- The number itself is in hire_contractor_private. Not sensitive on its own.
  show_phone boolean not null default true,
  website text,
  bio text,
  avatar_url text,
  base_zip_code text,
  -- Optional, and only published when the contractor opts in. Many work from a
  -- vehicle or a home address they would rather not put on a public profile.
  business_address text,
  show_business_address boolean not null default false,

  -- public identity (profile URL is /{username})
  username text unique,
  is_published boolean not null default false,
  published_at timestamptz,

  -- services offered: taxonomy slugs from docs/research/taxonomy/skills.json
  -- (scope - local/remote/both - is a property of the taxonomy, not the contractor)
  service_slugs text[] not null default '{}',

  -- service area
  service_zips text[] not null default '{}',
  service_cities text[] not null default '{}',
  service_states text[] not null default '{}',

  -- engagement
  engagement_types text[] not null default '{}',
  min_project_size numeric(12,2),
  max_project_size numeric(12,2),
  preferred_contact_method text not null default 'form'
    check (preferred_contact_method in ('phone', 'email', 'form')),

  -- rates
  hourly_rate numeric(10,2),
  rate_notes text,
  years_experience integer,

  -- credentials
  license_number text,
  insured boolean not null default false,

  -- trust (google_* is cached third-party data, refreshed out of band)
  rating numeric(2,1) not null default 0.0,
  review_count integer not null default 0,
  google_business_url text,
  google_place_id text,
  google_reviews jsonb not null default '[]'::jsonb,

  -- visibility / moderation
  is_active boolean not null default true,
  is_available boolean not null default true,
  is_searchable boolean not null default false,
  admin_paused boolean not null default false,

  -- ops
  crm_system text,
  total_requests integer not null default 0,

  -- consent
  terms_consent_date timestamptz,
  tcpa_consent boolean not null default false,
  consent_disclosure_version text,

  portfolio jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- ── Private contact details ────────────────────────────────────────────────────
-- Split out of hire_contractor_profiles so the public/private boundary is
-- STRUCTURAL rather than conditional.
--
-- Postgres RLS is row-level only - a policy can restrict which ROWS you see but
-- never which COLUMNS. So if phone/email sat on the profiles table, any public
-- read policy would expose them to anyone holding the publishable key:
--   GET /rest/v1/hire_contractor_profiles?select=phone,email
-- Keeping them in a table anonymous users have no grant or policy for closes
-- that off with nothing subtle to get wrong.
--
-- The only reader is pages/api/contractor-phone.ts (service role), which returns
-- one number per request so numbers can't be bulk-harvested.
create table if not exists public.hire_contractor_private (
  contractor_id uuid primary key
    references public.hire_contractor_profiles(id) on delete cascade,
  -- The full legal name lives here, not on the public row, so a contractor can
  -- publish as "Jane D." without the surname being readable.
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Reviews ────────────────────────────────────────────────────────────────────
-- First-party reviews. Mirrors investors.rating / review_count for the aggregate.
create table if not exists public.hire_contractor_reviews (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.hire_contractor_profiles(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text,
  rating smallint not null check (rating between 1 and 5),
  body text,
  job_ref text,
  created_at timestamptz not null default now()
);

-- ── Requests (client -> contractor) ────────────────────────────────────────────
-- Backs the "Request Quote" modal. Replaces the legacy paid `leads` flow.
create table if not exists public.hire_contractor_requests (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.hire_contractor_profiles(id) on delete cascade,
  client_user_id uuid references auth.users(id) on delete set null,
  client_name text,
  client_email text,
  client_phone text,
  service_slug text,
  zip_code text,
  message text,
  status text not null default 'new' check (status in ('new', 'viewed', 'responded', 'closed')),
  consent_disclosure_version text,
  created_at timestamptz not null default now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
create index if not exists hire_contractor_profiles_searchable_idx
  on public.hire_contractor_profiles (is_searchable) where is_searchable;
create index if not exists hire_contractor_profiles_active_idx
  on public.hire_contractor_profiles (is_active);
create index if not exists hire_contractor_profiles_admin_paused_idx
  on public.hire_contractor_profiles (admin_paused);
create index if not exists hire_contractor_profiles_google_place_idx
  on public.hire_contractor_profiles (google_place_id);

-- GIN indexes back the `@>` lookups the search does.
create index if not exists hire_contractor_profiles_services_idx
  on public.hire_contractor_profiles using gin (service_slugs);
create index if not exists hire_contractor_profiles_zips_idx
  on public.hire_contractor_profiles using gin (service_zips);
create index if not exists hire_contractor_profiles_cities_idx
  on public.hire_contractor_profiles using gin (service_cities);
create index if not exists hire_contractor_profiles_states_idx
  on public.hire_contractor_profiles using gin (service_states);

create index if not exists hire_contractor_reviews_contractor_idx
  on public.hire_contractor_reviews (contractor_id);
create index if not exists hire_contractor_requests_contractor_idx
  on public.hire_contractor_requests (contractor_id, created_at desc);
create index if not exists hire_contractor_requests_status_idx
  on public.hire_contractor_requests (status);

-- ── updated_at trigger ─────────────────────────────────────────────────────────
create or replace function public.hire_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hire_contractor_profiles_updated_at on public.hire_contractor_profiles;
create trigger hire_contractor_profiles_updated_at
  before update on public.hire_contractor_profiles
  for each row execute function public.hire_set_updated_at();

-- ── Row level security ─────────────────────────────────────────────────────────
alter table public.hire_contractor_profiles enable row level security;
alter table public.hire_contractor_reviews enable row level security;
alter table public.hire_contractor_requests enable row level security;

-- Profiles: owner full control, public read of publicly-listed profiles.
-- Safe to expose wholesale because the table holds no contact details - those
-- live in hire_contractor_private, which has no public access at all.
drop policy if exists "hire profiles owner all" on public.hire_contractor_profiles;
create policy "hire profiles owner all"
  on public.hire_contractor_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "hire profiles public read searchable" on public.hire_contractor_profiles;
create policy "hire profiles public read searchable"
  on public.hire_contractor_profiles for select
  using (is_searchable = true and is_active = true and admin_paused = false);

-- Private contact details: the owner, and nobody else.
-- The EXISTS subquery reads the owner's own profile row, which the owner policy
-- above permits, so this does not recurse.
alter table public.hire_contractor_private enable row level security;

drop policy if exists "hire private owner all" on public.hire_contractor_private;
create policy "hire private owner all"
  on public.hire_contractor_private for all
  using (exists (
    select 1 from public.hire_contractor_profiles p
    where p.id = contractor_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.hire_contractor_profiles p
    where p.id = contractor_id and p.user_id = auth.uid()
  ));

-- Anonymous visitors get nothing here. Defence in depth on top of RLS.
revoke all on public.hire_contractor_private from anon;

-- Reviews: public read, authenticated authors create their own
drop policy if exists "hire reviews public read" on public.hire_contractor_reviews;
create policy "hire reviews public read"
  on public.hire_contractor_reviews for select
  using (true);

drop policy if exists "hire reviews author insert" on public.hire_contractor_reviews;
create policy "hire reviews author insert"
  on public.hire_contractor_reviews for insert
  with check (auth.uid() = author_user_id);

drop policy if exists "hire reviews author update" on public.hire_contractor_reviews;
create policy "hire reviews author update"
  on public.hire_contractor_reviews for update
  using (auth.uid() = author_user_id)
  with check (auth.uid() = author_user_id);

drop policy if exists "hire reviews author delete" on public.hire_contractor_reviews;
create policy "hire reviews author delete"
  on public.hire_contractor_reviews for delete
  using (auth.uid() = author_user_id);

-- Requests: anyone (including anonymous visitors) can submit; only the
-- contractor can read or update the requests addressed to them.
drop policy if exists "hire requests anyone insert" on public.hire_contractor_requests;
create policy "hire requests anyone insert"
  on public.hire_contractor_requests for insert
  with check (true);

drop policy if exists "hire requests contractor read" on public.hire_contractor_requests;
create policy "hire requests contractor read"
  on public.hire_contractor_requests for select
  using (exists (
    select 1 from public.hire_contractor_profiles p
    where p.id = contractor_id and p.user_id = auth.uid()
  ));

drop policy if exists "hire requests contractor update" on public.hire_contractor_requests;
create policy "hire requests contractor update"
  on public.hire_contractor_requests for update
  using (exists (
    select 1 from public.hire_contractor_profiles p
    where p.id = contractor_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.hire_contractor_profiles p
    where p.id = contractor_id and p.user_id = auth.uid()
  ));
