-- ============================================================================
-- EduFund CEBBD — consolidated update (November 2026)
--
-- Run this ONCE in the Supabase SQL Editor: Dashboard -> SQL Editor -> New query.
-- It assumes supabase/schema.sql and supabase/donors-schema.sql already ran.
-- Safe to re-run: IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS throughout.
--
-- Contents
--   1  Safety: donors may only submit pending donations
--   2  Education categories (admin add / hide; hidden = invisible on the site)
--   3  Contact messages (public insert, admin read-only)
--   4  Donations: currency, card method, admin manual insert policy
--   5  Student support plans (USD pricing) + 18 published students
--   6  PostgREST schema reload
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Donation insert hardening
--    Re-stated so a donor can never create an approved / pre-reviewed row.
-- ----------------------------------------------------------------------------
drop policy if exists donations_owner_insert on public.donations;
create policy donations_owner_insert on public.donations
  for insert to authenticated
  with check (
    donor_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
    and payment_date <= current_date
    and public.donor_can_donate()
    and public.student_accepts_donations(student_id)
  );

-- ----------------------------------------------------------------------------
-- 2. Education categories
--    University Admission and Higher Education start hidden. Hidden categories
--    disappear from the public site, and their students disappear from
--    /students and the homepage automatically.
-- ----------------------------------------------------------------------------
create table if not exists public.education_categories (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

insert into public.education_categories (id, name, slug, description, sort_order, active)
values
  ('cat-diploma', 'Diploma Scholarship', 'diploma-scholarship',
   'Polytechnic and technical diploma programmes for students who need support with admission and semester fees.', 1, true),
  ('cat-university', 'University Admission', 'university-admission',
   'Support for admission fees, preparation, and the first year of undergraduate study.', 2, false),
  ('cat-higher', 'Higher Education', 'higher-education',
   'Continuing support for students already enrolled in degree programmes who are at risk of dropping out.', 3, false)
on conflict (id) do update
  set name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      sort_order = excluded.sort_order;
-- NOTE: `active` is intentionally not updated on re-run, so a category the
-- admin hid stays hidden.

alter table public.education_categories enable row level security;
revoke all on public.education_categories from anon, authenticated;
grant select on public.education_categories to anon, authenticated;
grant insert, update, delete on public.education_categories to authenticated;

drop policy if exists education_categories_public_read on public.education_categories;
create policy education_categories_public_read on public.education_categories
  for select to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists education_categories_admin_write on public.education_categories;
create policy education_categories_admin_write on public.education_categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists education_categories_touch on public.education_categories;
create trigger education_categories_touch
  before update on public.education_categories
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Contact messages — anyone may send, only admins may read, nobody edits
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(trim(name)) between 2 and 80),
  email      text not null check (char_length(email) <= 160),
  phone      text check (phone is null or char_length(phone) <= 30),
  subject    text not null default 'general'
             check (subject in ('general', 'donation', 'student', 'partnership', 'media')),
  message    text not null check (char_length(message) between 10 and 2000),
  status     text not null default 'new' check (status in ('new', 'read')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;

drop policy if exists contact_messages_public_insert on public.contact_messages;
create policy contact_messages_public_insert on public.contact_messages
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists contact_messages_admin_read on public.contact_messages;
create policy contact_messages_admin_read on public.contact_messages
  for select to authenticated
  using (public.is_admin());
-- No UPDATE/DELETE grant at all: the admin inbox is view-only by design.

-- ----------------------------------------------------------------------------
-- 4. Donations — currency support, card (international) payments, admin insert
-- ----------------------------------------------------------------------------
alter table public.donations
  add column if not exists currency text not null default 'BDT'
    check (currency in ('BDT', 'USD'));

alter table public.donations
  add column if not exists original_amount numeric(12, 2);

alter table public.donations drop constraint if exists donations_method_check;
alter table public.donations add constraint donations_method_check
  check (method in ('bank-transfer', 'bkash', 'nagad', 'card'));

-- Admins record donations received personally (bank / bKash / international).
drop policy if exists donations_admin_insert on public.donations;
create policy donations_admin_insert on public.donations
  for insert to authenticated
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Student support plans — USD-first pricing
--    Amounts stay canonical in BDT; the site shows USD (1 USD = 123 BDT).
--      monthly  : 2,100 / 1,600 / 1,100  ->  $17 / $13 / $9
--      yearly   : 7,000                   ->  ~$57 (2 semesters)
--      full     : 56,000                  ->  ~$455
--      one-time : 1,000 minimum, custom allowed
-- ----------------------------------------------------------------------------
alter table public.students
  add column if not exists support_monthly_options integer[]
  not null default '{2100,1600,1100}';

-- The public view must expose the extra column. `create or replace` can only
-- add columns at the end, which is what we do here.
create or replace view public.public_students
with (security_invoker = false) as
select
  id, slug, full_name, photo_url, gender, district, division, category_id,
  institution, headline, short_bio, story_family, story_challenges,
  story_ambitions, story_financial_needs, story_dreams, previous_exam,
  passing_year, result, future_goal, required_amount, campaign_status,
  visibility, featured, support_one_time, support_monthly, support_yearly,
  support_full_scholarship, created_at, support_monthly_options
from public.students
where visibility = 'published';

revoke all on public.public_students from anon, authenticated;
grant select on public.public_students to anon, authenticated;

update public.students
set support_one_time         = array[1000, 2500, 5000, 10000],
    support_monthly          = 2100,
    support_monthly_options  = array[2100, 1600, 1100],
    support_yearly           = 7000,
    support_full_scholarship = 56000,
    required_amount          = 56000;

-- Exactly 18 students are live: every diploma candidate is published, and any
-- other category or draft campaign is hidden from the public site.
update public.students
set visibility = 'published'
where category_id = 'cat-diploma'
  and campaign_status <> 'draft';

update public.students
set visibility = 'unpublished'
where category_id <> 'cat-diploma'
   or campaign_status = 'draft';

-- Show the six oldest verified profiles on the homepage first.
with picks as (
  select id
  from public.students
  where visibility = 'published'
  order by created_at asc
  limit 6
)
update public.students s
set featured = (s.id in (select id from picks));

-- ----------------------------------------------------------------------------
-- 6. Reload the PostgREST schema cache so the app sees the new columns/views
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- Verification queries (optional — run separately to confirm)
-- ----------------------------------------------------------------------------
-- select count(*) from public.public_students;                    -- expect 18
-- select id, name, active from public.education_categories order by sort_order;
-- select full_name, support_monthly, support_yearly, support_full_scholarship
--   from public.public_students limit 3;
-- select count(*) from public.contact_messages;
