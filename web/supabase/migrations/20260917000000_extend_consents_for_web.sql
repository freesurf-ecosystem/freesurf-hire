-- Extend the shared consent ledger so the web apps can record clickwrap
-- acceptance by anonymous visitors, with the evidence needed for an audit.
--
-- `public.consents` already exists and is written by the FreeSurf apps
-- (e.g. freesurf-post records type = 'terms'). Adding nullable columns is
-- backwards compatible with those writers.

alter table public.consents
  add column if not exists context text,
  add column if not exists ip text,
  add column if not exists user_agent text,
  add column if not exists metadata jsonb;

comment on column public.consents.user_id is
  'Subject identifier: an authenticated user id, or an anonymous session id for a visitor who is not signed in.';
comment on column public.consents.context is
  'Where the acceptance happened, e.g. contractor_card_contact | client_request | contractor_signup.';
comment on column public.consents.ip is
  'Server-derived request IP. Personal data under GDPR - see the retention note below.';
comment on column public.consents.metadata is
  'Optional structured extras, e.g. {"contractor_id": "..."}.';

-- Look-ups by document + version, and by context.
create index if not exists idx_consents_type_version
  on public.consents using btree (type, version);

-- ---------------------------------------------------------------------------
-- Follow-ups for whoever owns this table (not done here, since other apps
-- write to it and their flows need checking first):
--
--   1. RLS. If `consents` is currently anon-insertable, the ledger can be
--      forged. The web route writes through the service role, so tightening
--      this only affects the direct browser writers.
--   2. Retention. `ip` is personal data. Define and enforce a window
--      (e.g. delete rows older than N months) to satisfy data minimisation.
--   3. freesurf-post/dashboard/js/dashboard.js:317 inserts without `user_id`,
--      which is `not null` - that insert likely fails silently.
-- ---------------------------------------------------------------------------
