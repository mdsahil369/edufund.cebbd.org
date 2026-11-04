# Donor সিস্টেম — Supabase সেটআপ (বাংলা)

এই ডকুমেন্টে EduFund CEBBD-এর donor/donation সিস্টেম চালু করার সম্পূর্ণ ধাপগুলো আছে।
কোড আগে থেকেই Supabase-এর সাথে সংযুক্ত; শুধু নিচের SQL আর কয়েকটি সেটিং লাগবে।

> গুরুত্বপূর্ণ: **message সিস্টেম ইচ্ছাকৃতভাবে static** (আগের মতোই localStorage-এ) রাখা হয়েছে।
> শুধু donor প্রোফাইল, donation, campaign total আর supporter list Supabase-এ যায়।

---

## ১. কোন ফাইল কী কাজ করে

| ফাইল | কাজ |
| --- | --- |
| `supabase/schema.sql` | students টেবিল, `public_students` view, `is_admin()` — এটা আগেই চালানো থাকতে হবে |
| `supabase/donors-schema.sql` | donors + donations টেবিল, RLS, trigger, public view, avatar storage bucket |
| `src/app/dashboard/actions.ts` | donor profile load/create/update, privacy toggle, donation submit |
| `src/app/admin/donors/actions.ts` | admin donor list, suspend/reactivate, admin note, donation approve/reject |
| `src/lib/services/funding.ts` | public campaign totals + masked supporter list |
| `src/lib/store/demo-store.tsx` | লগইন করা user অনুযায়ী Supabase থেকে data load |

---

## ২. `.env.local` চেক করুন

প্রজেক্ট রুটে `.env.local` ফাইলে এই দুটি থাকতে হবে (`.env.example`-এও আছে):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable / anon key>
```

> `service_role` key কোথাও বসাবেন না — donor data RLS দিয়েই সুরক্ষিত।

---

## ৩. SQL চালানোর ক্রম

Supabase Dashboard → **SQL Editor** → **New query** → পুরো ফাইল পেস্ট → **Run**।

1. **`supabase/schema.sql`** — students টেবিল ও `public_students` view (আগে চালানো না থাকলে)।
2. **`supabase/donors-schema.sql`** — donor/donation টেবিল, RLS, trigger, view, storage bucket।

দুটোই বারবার চালানো নিরাপদ (`if not exists` / `create or replace` ব্যবহার করা হয়েছে)।
`donors-schema.sql` চালানোর আগে অবশ্যই `public.students` টেবিল থাকতে হবে, কারণ
`donations.student_id` ওই টেবিলে foreign key।

---

## ৪. প্রথম admin বানানো

সাধারণত সাইটে register করলে সবাই **donor** হয়। Admin হতে হলে Supabase-এ role বসাতে হবে:

```sql
-- আপনার admin account-এর email বসান
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';
```

এরপর:

1. সাইট থেকে **log out** করুন।
2. আবার **log in** করুন (নতুন JWT-তে role আসবে)।
3. `/admin` খুলবে। role না এলে browser-এর session refresh করতে log out → log in করুন।

Admin account-এর জন্য donor row তৈরি হয় না (`handle_new_donor` trigger admin role বাদ দেয়)।
আগে donor হিসেবে register করা account-কে admin বানালে পুরোনো donor row থেকে যায় — এতে ক্ষতি নেই।

---

## ৫. Email confirmation (ঐচ্ছিক)

Register করার পর সরাসরি dashboard-এ ঢুকতে চাইলে:

Supabase Dashboard → **Authentication → Providers → Email** →
**Confirm email** বন্ধ করুন।

চালু রাখলে user email-এর link-এ click করার পরেই log in করতে পারবে; অ্যাপ
`needsEmailConfirmation` message দেখাবে।

---

## ৬. যা স্বয়ংক্রিয়ভাবে তৈরি হয়

- **Table `public.donors`** — প্রতি donor-এর একটাই row, `auth.users.id` key।
- **Table `public.donations`** — manual payment submission; status শুরুতে `pending`।
- **Receipt number** — `EF-2026-3001` ফরম্যাটে DB sequence থেকে (`donation_receipt_seq`, শুরু 3001)।
- **Transaction ID** — case-insensitive unique; একই bKash/Nagad/bank reference দুইবার দেওয়া যাবে না।
- **View `public.student_funding_summary`** — শুধু approved donation-এর total, count, supporter সংখ্যা।
- **View `public.public_approved_donations`** — supporter নাম SQL-এর ভেতরেই mask করা
  (`show_name_publicly = false` হলে "Anonymous Supporter")।
- **Storage bucket `donor-avatars`** (public) — প্রতিটি donor শুধু নিজের `<uid>/` ফোল্ডারে upload করতে পারে।

---

## ৭. কে কী করতে পারে (RLS সারাংশ)

| কাজ | Donor | Admin |
| --- | --- | --- |
| নিজের donor profile দেখা/এডিট | ✅ | ✅ (সব donor) |
| অন্য donor-এর প্রোফাইল | ❌ | ✅ |
| নিজের donation submit (status `pending`) | ✅ | ❌ (admin donate করতে পারে না) |
| নিজের donation দেখা | ✅ | ✅ (সব) |
| Donation approve/reject | ❌ | ✅ |
| Donor suspend/reactivate, admin note | ❌ | ✅ |
| Status/admin note নিজে বদলানো | ❌ (trigger আগের মান ফিরিয়ে দেয়) | ✅ |
| Public total/supporter list | সবার জন্য read-only view | ✅ |

Donation submit করার সময় DB-তেও চেক হয়:

- donor account `active` (suspended হলে block),
- campaign `published` এবং `active` বা `fully-funded`,
- status জোর করে `pending`, `reviewed_at`/`reviewed_by` খালি।

---

## ৮. টেস্ট করার ধাপ

1. `/register` → নতুন donor account (email confirm বন্ধ থাকলে সরাসরি login)।
2. `/dashboard/profile` → নাম, phone, address, bio, ছবি save করুন → reload দিয়ে চেক করুন।
3. `/students` → একটি student খুলে **Support this student** → donation submit করুন।
   - transaction ID ইউনিক হতে হবে, minimum ৳100।
4. `/dashboard` ও `/dashboard/donations` → donation **Pending** দেখাবে, receipt number সহ।
5. Admin account দিয়ে `/admin/donations` → **Approve** করুন।
6. Donor account-এ ফিরে `/dashboard` → status **Approved**; student-এর public page-এ
   raised total ও supporter list-এ নাম (প্রাইভেসি on থাকলে) দেখা যাবে।
7. `/admin/donors` → donor suspend করুন → donor আবার donate করতে গেলে ব্লক হবে।
8. `/dashboard/privacy` → নাম public toggle বন্ধ করলে public list-এ "Anonymous Supporter" হবে।

---

## ৯. যাচাইয়ের SQL

```sql
-- donor ও donation সংখ্যা
select
  (select count(*) from public.donors) as donors,
  (select count(*) from public.donations) as donations,
  (select count(*) from public.donations where status = 'pending') as pending;

-- কোনো student-এর approved total ঠিক আছে কি না
select * from public.student_funding_summary order by raised desc;

-- public supporter list (নাম mask করা অবস্থায়)
select student_id, donor_name, amount, is_anonymous
from public.public_approved_donations
order by submitted_at desc
limit 20;

-- RLS চালু আছে কি না (দুটোই true হওয়া উচিত)
select relname, relrowsecurity
from pg_class
where relname in ('donors', 'donations');

-- trigger গুলো
select tgname from pg_trigger
where tgrelid = 'public.donors'::regclass and not tgisinternal;
```

---

## ১০. সমস্যা ও সমাধান

| সমস্যা | কারণ / সমাধান |
| --- | --- |
| `relation "public.donors" does not exist` | `supabase/donors-schema.sql` চালানো হয়নি |
| `donations_student_id_fkey` error | student id ভুল, অথবা `students` টেবিলে ওই row নেই |
| "This transaction ID has already been submitted" | একই transaction ID আগে ব্যবহার হয়েছে; receipt চেক করুন |
| "not allowed … campaign may have closed" | campaign `published` নয় বা `active`/`fully-funded` নয়, অথবা donor suspended |
| Admin panel-এ redirect হয়ে যাচ্ছে | role বসানোর পর log out → log in করেননি |
| ছবি upload ব্যর্থ | `donor-avatars` bucket/policies তৈরি হয়নি, অথবা ফাইল 2 MB-এর বেশি |
| Public page-এ total 0 | donation এখনো `pending`; admin approve করেননি |
| Donor dashboard খালি | `.env.local`-এ Supabase URL/key নেই, অথবা `donors` টেবিল তৈরি হয়নি |

Server log-এ `[admin/donors]`, `[donations]`, `[funding]` prefix দেখে সমস্যা শনাক্ত করা যায়।

---

## ১১. ব্যাকআপ / রিসেট (সাবধান)

```sql
-- শুধু টেস্ট donation মুছতে (donor account থাকবে)
delete from public.donations where status = 'pending';

-- পুরো donor সিস্টেম রিসেট (মুছে ফেলা আর ফেরানো যাবে না)
-- delete from public.donations;
-- delete from public.donors;
```

Donor account মুছলে (`auth.users` থেকে) তার donations-ও cascade-এ মুছে যাবে।
