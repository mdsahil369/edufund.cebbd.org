-- ============================================================================
-- EduFund CEBBD — website settings stored in Supabase
--
-- Run this once in Supabase → SQL Editor → New query → Run.
-- After it succeeds, the admin panel's "Site Settings" and "Payment Settings"
-- pages write to and read from this table instead of the browser.
-- ============================================================================

create table if not exists public.site_settings (
  id text primary key default 'default',
  -- Payment details shown in the manual donation flow (bank, bKash, WhatsApp…)
  payment jsonb not null default '{}'::jsonb,
  -- Public site details (name, tagline, contact, announcement, socials…)
  site jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is
  'Single (id = ''default'') row holding the payment and public site settings edited in the admin panel.';

-- The site is public, so these settings are readable by everyone (anon included).
alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select
  using (true);

-- Only administrators may insert or change the row.
drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Keep updated_at accurate on every save.
create or replace function public.touch_site_settings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_site_settings();

-- Create the single settings row. Values stay empty ({}), and the app fills any
-- missing field with its built-in defaults until an admin saves from the panel.
insert into public.site_settings (id)
values ('default')
on conflict (id) do nothing;

-- Let PostgREST pick up the new table immediately.
notify pgrst, 'reload schema';
