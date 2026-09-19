-- Business address for contractor profiles.
--
-- Optional, and published only when the contractor opts in - plenty of
-- contractors work out of a vehicle or a home address they would rather not put
-- on a public profile. Because it is opt-in public it belongs on the profile row
-- itself, unlike email/phone which live in hire_contractor_private.
--
-- Written as a separate migration because
-- 20260916120000_create_hire_contractor_tables.sql had already been applied
-- before these columns were needed. It is idempotent, so on a fresh database
-- (where the create-table migration already declares both columns) it is a
-- no-op.

alter table public.hire_contractor_profiles
  add column if not exists business_address text,
  add column if not exists show_business_address boolean not null default false;
