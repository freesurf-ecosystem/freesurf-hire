-- Lightweight, single-opt-in update subscriptions (product / ecosystem news).
--
-- Deliberately separate from public.newsletter_signups:
--   * newsletter_signups is the Feedfree Digest list. Its `status` column encodes
--     the double-opt-in state (pending -> confirmed) and its `topics` column is
--     which digest CONTENT topics a subscriber follows. Neither fits a
--     single-opt-in product list.
--   * This table uses one row per (email, list), so lists can be added without a
--     migration and each list can be unsubscribed independently.
--
-- Writes go through the server (pages/api/subscribe.ts) using the service role,
-- so the recorded IP is server-derived rather than trusted from the client.
-- RLS is enabled with NO policies: anon/authenticated are denied entirely.

create table if not exists public.update_subscriptions (
  id bigint generated always as identity primary key,

  email text not null,

  -- which list they opted into
  list text not null
    check (list in ('product_updates', 'ecosystem_updates')),

  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),

  -- where the opt-in happened, e.g. 'contractor_signup'
  source text,

  -- consent evidence
  consent_version text,
  consented_at timestamptz not null default now(),
  consent_ip text,
  user_agent text,

  -- one-click unsubscribe from emails
  unsubscribe_token text unique,

  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (email, list)
);

create index if not exists update_subscriptions_email_idx
  on public.update_subscriptions (email);

create index if not exists update_subscriptions_list_status_idx
  on public.update_subscriptions (list, status);

create index if not exists update_subscriptions_unsubscribe_token_idx
  on public.update_subscriptions (unsubscribe_token);

alter table public.update_subscriptions enable row level security;

-- INSERT-ONLY for anon/authenticated.
--
-- Other FreeSurf apps (e.g. the Post dashboard) record opt-ins straight from the
-- browser with the publishable key, so they need insert access. Crucially there
-- is NO update/delete policy, so the list cannot be edited or scraped with the
-- publishable key - only appended to.
--
-- Trade-off: rows written this way have a null `consent_ip`, because a browser
-- cannot supply a trustworthy one. The hire app writes through
-- pages/api/subscribe.ts (service role) and does capture a real IP. If you want
-- IPs everywhere, move the client writers to a server endpoint.
drop policy if exists "update subscriptions anyone insert" on public.update_subscriptions;
create policy "update subscriptions anyone insert"
  on public.update_subscriptions for insert
  to anon, authenticated
  with check (true);

-- A signed-in user can read their OWN rows (matched on the JWT email), so the
-- contractor dashboard can show current preferences. Still no way to read
-- anyone else's list membership.
drop policy if exists "update subscriptions own read" on public.update_subscriptions;
create policy "update subscriptions own read"
  on public.update_subscriptions for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- No update/delete policies: changes go through pages/api/subscribe.ts, which
-- uses the service role and records the IP.
--
-- Retention: `consent_ip` is personal data. Define and enforce a window for
-- unsubscribed rows rather than keeping them indefinitely.
