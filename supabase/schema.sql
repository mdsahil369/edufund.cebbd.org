-- ============================================================================
-- EduFund CEBBD — student data schema
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: it uses IF NOT EXISTS / OR REPLACE where possible.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper: is the current user an admin?
--    Role lives in auth.users.raw_app_meta_data -> app_metadata.role
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
-- 2. students table
--    `id` is text on purpose: existing rows use ids like "stu-01" so that
--    donation and message records keep pointing at the right student.
-- ----------------------------------------------------------------------------
create table if not exists public.students (
  id                          text primary key,
  slug                        text not null unique,
  full_name                   text not null,
  photo_url                   text,
  gender                      text check (gender in ('male', 'female', 'other')),
  district                    text not null,
  division                    text not null,
  category_id                 text not null,
  institution                 text not null,
  headline                    text not null,
  short_bio                   text not null,
  story_family                text not null,
  story_challenges            text not null,
  story_ambitions             text not null,
  story_financial_needs       text not null,
  story_dreams                text not null,
  previous_exam               text not null,
  passing_year                integer not null,
  result                      text not null,
  future_goal                 text not null,
  required_amount             numeric(12, 2) not null default 0,
  campaign_status             text not null default 'draft'
                              check (campaign_status in ('active', 'fully-funded', 'completed', 'paused', 'draft')),
  visibility                  text not null default 'unpublished'
                              check (visibility in ('published', 'unpublished')),
  featured                    boolean not null default false,
  support_one_time            integer[] not null default '{}',
  support_monthly             numeric(12, 2) not null default 0,
  support_yearly              numeric(12, 2) not null default 0,
  support_full_scholarship    numeric(12, 2) not null default 0,
  -- Private columns: never exposed through the public view below.
  private_mobile              text,
  private_father_name         text,
  private_mother_name         text,
  private_address             text,
  private_guardian_occupation text,
  private_family_income       numeric(12, 2),
  private_admin_notes         text,
  created_by                  uuid default auth.uid() references auth.users (id) on delete set null,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists students_visibility_idx on public.students (visibility);
create index if not exists students_category_idx on public.students (category_id);
create index if not exists students_created_at_idx on public.students (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. Row Level Security — only admins can touch the base table.
--    Supabase grants new tables to anon/authenticated by default, so the
--    REVOKE below is required to keep private columns private.
-- ----------------------------------------------------------------------------
alter table public.students enable row level security;

revoke all on public.students from anon, authenticated;
grant select, insert, update, delete on public.students to authenticated;

drop policy if exists students_admin_select on public.students;
create policy students_admin_select on public.students
  for select to authenticated
  using (public.is_admin());

drop policy if exists students_admin_insert on public.students;
create policy students_admin_insert on public.students
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists students_admin_update on public.students;
create policy students_admin_update on public.students
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists students_admin_delete on public.students;
create policy students_admin_delete on public.students
  for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Public view — published students, public columns only.
--    The website (anon key) reads this view, never the base table.
-- ----------------------------------------------------------------------------
create or replace view public.public_students
with (security_invoker = false) as
select
  id,
  slug,
  full_name,
  photo_url,
  gender,
  district,
  division,
  category_id,
  institution,
  headline,
  short_bio,
  story_family,
  story_challenges,
  story_ambitions,
  story_financial_needs,
  story_dreams,
  previous_exam,
  passing_year,
  result,
  future_goal,
  required_amount,
  campaign_status,
  visibility,
  featured,
  support_one_time,
  support_monthly,
  support_yearly,
  support_full_scholarship,
  created_at
from public.students
where visibility = 'published';

revoke all on public.public_students from anon, authenticated;
grant select on public.public_students to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Keep updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists students_touch_updated_at on public.students;
create trigger students_touch_updated_at
  before update on public.students
  for each row
  execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Storage bucket for student photos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

drop policy if exists student_photos_public_read on storage.objects;
create policy student_photos_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'student-photos');

drop policy if exists student_photos_admin_insert on storage.objects;
create policy student_photos_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'student-photos' and public.is_admin());

drop policy if exists student_photos_admin_update on storage.objects;
create policy student_photos_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'student-photos' and public.is_admin());

drop policy if exists student_photos_admin_delete on storage.objects;
create policy student_photos_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'student-photos' and public.is_admin());
