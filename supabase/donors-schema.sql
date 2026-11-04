-- ============================================================================
-- EduFund CEBBD — donor & donation schema
--
-- Run AFTER supabase/schema.sql (the students table must already exist).
-- Run once in the Supabase SQL Editor: Dashboard -> SQL Editor -> New query.
-- Safe to re-run: it uses IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS.
--
-- Bangla step-by-step instructions: supabase/DONOR-SETUP-BN.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper: is the current user an admin?
--    Role lives in auth.users.raw_app_meta_data -> app_metadata.role
--    (re-declared here so this file also works on its own)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ----------------------------------------------------------------------------
-- 2. donors — one row per donor account, keyed by auth.users.id
-- ----------------------------------------------------------------------------
create table if not exists public.donors (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text not null default 'Supporter',
  email              text not null default '',
  phone              text,
  address            text,
  bio                text,
  avatar_url         text,
  -- Donor-controlled privacy switch. When false the public view shows
  -- "Anonymous Supporter" and never exposes the real name.
  show_name_publicly boolean not null default false,
  -- Admin-controlled account state. Suspended donors cannot submit donations.
  status             text not null default 'active'
                     check (status in ('active', 'suspended')),
  -- Admin-only internal note, never shown to the donor or the public.
  admin_notes        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists donors_status_idx on public.donors (status);
create index if not exists donors_created_at_idx on public.donors (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. donations — manual payment submissions verified by an admin
-- ----------------------------------------------------------------------------
create sequence if not exists public.donation_receipt_seq start with 3001;
grant usage, select on sequence public.donation_receipt_seq to authenticated;

create table if not exists public.donations (
  id                uuid primary key default gen_random_uuid(),
  receipt_number    text not null unique
                    default ('EF-' || to_char(now(), 'YYYY') || '-' ||
                             lpad(nextval('public.donation_receipt_seq')::text, 4, '0')),
  donor_id          uuid not null references public.donors (id) on delete cascade,
  student_id        text not null references public.students (id) on delete restrict,
  type              text not null
                    check (type in ('one-time', 'monthly', 'yearly', 'full-scholarship')),
  amount            numeric(12, 2) not null check (amount > 0),
  method            text not null
                    check (method in ('bank-transfer', 'bkash', 'nagad')),
  transaction_id    text not null,
  sender_reference  text not null,
  payment_date      date not null,
  message           text,
  status            text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  submitted_at      timestamptz not null default now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid references auth.users (id) on delete set null,
  review_note       text
);

create index if not exists donations_donor_idx on public.donations (donor_id);
create index if not exists donations_student_idx on public.donations (student_id);
create index if not exists donations_status_idx on public.donations (status);
create index if not exists donations_submitted_at_idx on public.donations (submitted_at desc);

-- A transaction ID may only be used once (case-insensitive), so the same
-- bKash / Nagad / bank reference cannot be claimed by two donations.
create unique index if not exists donations_transaction_id_key
  on public.donations (lower(transaction_id));

-- ----------------------------------------------------------------------------
-- 4. Guard helpers used by the policies below
-- ----------------------------------------------------------------------------

-- A suspended donor cannot submit new donations.
create or replace function public.donor_can_donate()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.donors d
    where d.id = auth.uid() and d.status = 'active'
  );
$$;

-- Donations are only accepted for published campaigns that are still open.
-- SECURITY DEFINER so it can read the admin-only students table.
create or replace function public.student_accepts_donations(p_student_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and s.visibility = 'published'
      and s.campaign_status in ('active', 'fully-funded')
  );
$$;

grant execute on function public.donor_can_donate() to authenticated;
grant execute on function public.student_accepts_donations(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Row Level Security
--    New Supabase tables are granted to anon/authenticated by default, so the
--    REVOKE below is required before the policies are added.
-- ----------------------------------------------------------------------------
alter table public.donors enable row level security;
revoke all on public.donors from anon, authenticated;
grant select, insert, update, delete on public.donors to authenticated;

drop policy if exists donors_self_select on public.donors;
create policy donors_self_select on public.donors
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists donors_self_insert on public.donors;
create policy donors_self_insert on public.donors
  for insert to authenticated
  with check (id = auth.uid() or public.is_admin());

drop policy if exists donors_self_update on public.donors;
create policy donors_self_update on public.donors
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists donors_admin_delete on public.donors;
create policy donors_admin_delete on public.donors
  for delete to authenticated
  using (public.is_admin());

alter table public.donations enable row level security;
revoke all on public.donations from anon, authenticated;
grant select, insert, update, delete on public.donations to authenticated;

drop policy if exists donations_owner_select on public.donations;
create policy donations_owner_select on public.donations
  for select to authenticated
  using (donor_id = auth.uid() or public.is_admin());

-- Donors can only create their own donation, and it always starts as pending.
-- Approval / rejection is admin-only.
drop policy if exists donations_owner_insert on public.donations;
create policy donations_owner_insert on public.donations
  for insert to authenticated
  with check (
    donor_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
    and public.donor_can_donate()
    and public.student_accepts_donations(student_id)
  );

drop policy if exists donations_admin_update on public.donations;
create policy donations_admin_update on public.donations
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists donations_admin_delete on public.donations;
create policy donations_admin_delete on public.donations
  for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Triggers
--    a) create a donor profile for every new auth user (admins excluded)
--    b) keep donors in sync when the sign-in email changes
--    c) stop a donor from changing admin-only fields on their own row
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_donor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Staff accounts get the admin role in app_metadata; they are not donors.
  if coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin' then
    return new;
  end if;

  insert into public.donors (id, full_name, email, phone)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(new.email, 'Supporter'), '@', 1)
    ),
    coalesce(new.email, ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_donor on auth.users;
create trigger on_auth_user_created_donor
  after insert on auth.users
  for each row
  execute function public.handle_new_donor();

create or replace function public.sync_donor_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.donors
       set email = coalesce(new.email, email)
     where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed_donor on auth.users;
create trigger on_auth_user_email_changed_donor
  after update of email on auth.users
  for each row
  execute function public.sync_donor_email();

create or replace function public.protect_donor_account_fields()
returns trigger
language plpgsql
as $$
begin
  -- Donors may edit their own profile, but never their id, account status,
  -- admin notes or join date. Admins can change everything.
  if not public.is_admin() then
    new.id := old.id;
    new.status := old.status;
    new.admin_notes := old.admin_notes;
    new.created_at := old.created_at;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists donors_protect_fields on public.donors;
create trigger donors_protect_fields
  before update on public.donors
  for each row
  execute function public.protect_donor_account_fields();

-- Backfill profiles for accounts that already exist in auth.users.
insert into public.donors (id, full_name, email, phone)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(u.email, 'Supporter'), '@', 1)
  ),
  coalesce(u.email, ''),
  nullif(trim(u.raw_user_meta_data ->> 'phone'), '')
from auth.users u
where coalesce(u.raw_app_meta_data ->> 'role', '') <> 'admin'
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 7. Public views
--    `security_invoker = false` + explicit grants so the anon key can read
--    only these public columns. Private donor data stays in the base tables.
-- ----------------------------------------------------------------------------

-- Raised totals per student (approved donations only).
create or replace view public.student_funding_summary
with (security_invoker = false) as
select
  d.student_id,
  coalesce(sum(d.amount), 0)::numeric(12, 2) as raised,
  count(*)::integer as approved_donation_count,
  count(distinct d.donor_id)::integer as supporter_count
from public.donations d
where d.status = 'approved'
group by d.student_id;

revoke all on public.student_funding_summary from anon, authenticated;
grant select on public.student_funding_summary to anon, authenticated;

-- Approved donations with the donor name masked inside SQL. The real name is
-- never selected when show_name_publicly is false, so even a direct API call
-- with the publishable key cannot reveal it.
create or replace view public.public_approved_donations
with (security_invoker = false) as
select
  d.id,
  d.student_id,
  d.amount,
  d.type,
  d.payment_date,
  d.submitted_at,
  case
    when dn.show_name_publicly and nullif(trim(dn.full_name), '') is not null
      then dn.full_name
    else 'Anonymous Supporter'
  end as donor_name,
  (not dn.show_name_publicly) as is_anonymous
from public.donations d
join public.donors dn on dn.id = d.donor_id
where d.status = 'approved';

revoke all on public.public_approved_donations from anon, authenticated;
grant select on public.public_approved_donations to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 8. Storage bucket for donor avatars
--    Files live under <donor uuid>/ so each donor can only write their own.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('donor-avatars', 'donor-avatars', true)
on conflict (id) do nothing;

drop policy if exists donor_avatars_public_read on storage.objects;
create policy donor_avatars_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'donor-avatars');

drop policy if exists donor_avatars_owner_insert on storage.objects;
create policy donor_avatars_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'donor-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists donor_avatars_owner_update on storage.objects;
create policy donor_avatars_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'donor-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'donor-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists donor_avatars_owner_delete on storage.objects;
create policy donor_avatars_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'donor-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
