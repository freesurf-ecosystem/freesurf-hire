-- Public display name preference, and moving the full legal name off the public row.
--
-- Until now first_name/last_name lived on hire_contractor_profiles. That table is
-- readable by anyone holding the publishable key (RLS restricts which ROWS are
-- visible, not which columns), so storing a full name there made the "first name
-- plus last initial" option cosmetic - the surname was still fetchable.
--
-- The full name now lives in hire_contractor_private (owner-only RLS, same place
-- as email and phone), and the public row carries only the derived display_name:
--   * 'personal' -> "Jane D."    (first name + last initial)
--   * 'business' -> the company name
--
-- Idempotent, and a no-op on a fresh database where the create-table migration
-- already declares the columns in their new home.

alter table public.hire_contractor_private
  add column if not exists first_name text,
  add column if not exists last_name text;

alter table public.hire_contractor_profiles
  add column if not exists name_display text not null default 'personal';

alter table public.hire_contractor_profiles
  drop constraint if exists hire_contractor_profiles_name_display_check;

alter table public.hire_contractor_profiles
  add constraint hire_contractor_profiles_name_display_check
  check (name_display in ('business', 'personal'));

alter table public.hire_contractor_profiles
  drop column if exists first_name,
  drop column if exists last_name;
