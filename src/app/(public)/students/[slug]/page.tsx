import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Heart,
  Home,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { StudentAvatar } from "@/components/students/student-avatar";
import { FundingProgress } from "@/components/students/funding-progress";
import { StudentCard } from "@/components/students/student-card";
import { MessageStudentButton } from "@/components/students/message-student-button";
import { ShareProfileButton } from "@/components/students/share-profile-button";
import {
  StatusPill,
  campaignStatusTone,
} from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import {
  getEducationCategoryById,
  getPublishedStudents,
  getStudentBySlug,
} from "@/lib/services/students";
import {
  fundingForStudent,
  getFundingTotals,
  getRecentSupporters,
} from "@/lib/services/funding";
import {
  campaignStatusLabels,
  donationTypeLabels,
  formatMoney,
  formatDate,
} from "@/lib/utils";
import { toPublicStudent } from "@/lib/students";

// Student slugs live in Supabase and can change at any time, so these pages are
// rendered on demand instead of being pre-generated at build time.
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/students/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const student = await getStudentBySlug(slug);
  if (!student) return { title: "Student not found" };

  const category = await getEducationCategoryById(student.categoryId);
  return {
    title: `${student.fullName} — ${category?.name ?? "Student"}`,
    description: student.shortBio,
    alternates: { canonical: `/students/${student.slug}` },
    openGraph: {
      title: `${student.fullName} needs support to continue studying`,
      description: student.shortBio,
      type: "profile",
    },
  };
}

const storySections = [
  { key: "family", title: "Family circumstances", icon: Home },
  { key: "challenges", title: "Educational challenges", icon: AlertCircle },
  { key: "ambitions", title: "Academic ambitions", icon: Target },
  { key: "financialNeeds", title: "Financial needs", icon: Wallet },
  { key: "dreams", title: "Future dreams", icon: Sparkles },
] as const;

export default async function StudentProfilePage({
  params,
}: PageProps<"/students/[slug]">) {
  const { slug } = await params;
  const student = await getStudentBySlug(slug);
  if (!student) notFound();

  const [totals, recentSupporters, category] = await Promise.all([
    getFundingTotals(),
    getRecentSupporters(student.id, 5),
    getEducationCategoryById(student.categoryId),
  ]);
  const funding = fundingForStudent(student, totals);
  const firstName = student.fullName.split(" ")[0];

  const relatedStudents = (await getPublishedStudents({ categoryId: student.categoryId }))
    .filter((item) => item.id !== student.id)
    .slice(0, 3)
    .map(toPublicStudent);

  const supportOptions = [
    {
      type: "one-time",
      icon: Heart,
      label: "One-time donation",
      amount: `From ${formatMoney(Math.min(...student.supportPlans.oneTimeOptions))}`,
      description: "Give any amount you choose",
      recommended: false,
      tiers: [] as number[],
    },
    {
      type: "monthly",
      icon: CalendarClock,
      label: "Monthly sponsorship",
      amount: `${formatMoney(student.supportPlans.monthly)} / month`,
      description: "Full support — most popular",
      recommended: true,
      tiers: student.supportPlans.monthlyOptions,
    },
    {
      type: "yearly",
      icon: CalendarDays,
      label: "Yearly sponsorship",
      amount: `${formatMoney(student.supportPlans.yearly)} / year`,
      description: "Cover a full academic year",
      recommended: false,
      tiers: [] as number[],
    },
    {
      type: "full-scholarship",
      icon: GraduationCap,
      label: "Full scholarship",
      amount: formatMoney(student.supportPlans.fullScholarship),
      description: "Meet the remaining campaign need",
      recommended: false,
      tiers: [] as number[],
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="pattern-dots absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="container-page relative py-3 sm:py-4">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-muted"
          >
            <Link href="/" className="transition-colors hover:text-brand">
              Home
            </Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <Link href="/students" className="transition-colors hover:text-brand">
              Student Archive
            </Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span className="font-medium text-ink">{student.fullName}</span>
          </nav>

          <div className="mt-3 overflow-hidden rounded-3xl border border-border bg-white shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)]">
            <div className="relative h-24 bg-gradient-to-r from-navy via-navy-light to-brand-dark sm:h-28">
              <div className="pattern-grid absolute inset-0 opacity-80" aria-hidden="true" />
              <div
                className="absolute -top-10 right-10 size-40 rounded-full bg-white/10 blur-xl"
                aria-hidden="true"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <StatusPill tone="success" className="border-white/20 bg-white/15 text-white backdrop-blur-sm">
                  <BadgeCheck className="size-3" />
                  Verified
                </StatusPill>
                <StatusPill
                  tone={campaignStatusTone(student.campaignStatus)}
                  className="border-white/20 bg-white/15 text-white backdrop-blur-sm"
                >
                  {campaignStatusLabels[student.campaignStatus]}
                </StatusPill>
              </div>
              <span className="absolute top-4 left-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {category?.name}
              </span>
            </div>

            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
                <StudentAvatar
                  name={student.fullName}
                  photoUrl={student.photoUrl}
                  size="2xl"
                  priority
                  className="ring-4 ring-white"
                />
                <div className="min-w-0 flex-1 sm:pb-1">
                  <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                    {student.fullName}
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-slate-muted">
                    {student.headline}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-slate-muted">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-brand" />
                      {student.district}, {student.division}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-brand" />
                      {student.institution}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-brand" />
                      {category?.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:pb-1">
                  <Button asChild size="lg">
                    <Link href={`/students/${student.slug}/donate`}>
                      <Heart className="size-4" />
                      Support this student
                    </Link>
                  </Button>
                  <MessageStudentButton
                    studentId={student.id}
                    studentName={student.fullName}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-[11px] font-medium text-slate-muted">
                    Required funding
                  </p>
                  <p className="mt-1 text-lg font-bold text-navy">
                    {formatMoney(funding.required)}
                  </p>
                </div>
                <div className="rounded-xl border border-brand/15 bg-brand-soft p-4">
                  <p className="text-[11px] font-medium text-slate-muted">
                    Raised (approved only)
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-dark">
                    {formatMoney(funding.raised)}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-4">
                  <p className="text-[11px] font-medium text-amber-700/80">
                    Still needed
                  </p>
                  <p className="mt-1 text-lg font-bold text-amber-800">
                    {formatMoney(funding.remaining)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-ink">
                    {funding.percent}% funded
                  </span>
                  <span className="text-slate-muted">
                    {funding.supporterCount} verified{" "}
                    {funding.supporterCount === 1 ? "supporter" : "supporters"}
                  </span>
                </div>
                <FundingProgress percent={funding.percent} className="h-2.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-6">
          <section className="card-surface p-6 sm:p-7">
            <h2 className="text-xl font-bold text-navy">About {firstName}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              {student.shortBio}
            </p>
            <dl className="mt-6 grid gap-4 border-t border-dashed border-border pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                  Full name
                </dt>
                <dd className="mt-1 text-[13.5px] font-medium text-ink">
                  {student.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                  Location
                </dt>
                <dd className="mt-1 text-[13.5px] font-medium text-ink">
                  {student.district}, {student.division}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                  Education background
                </dt>
                <dd className="mt-1 text-[13.5px] font-medium text-ink">
                  {student.institution}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                  Education category
                </dt>
                <dd className="mt-1 text-[13.5px] font-medium text-ink">
                  {category?.name}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card-surface p-6 sm:p-7">
            <h2 className="text-xl font-bold text-navy">Educational information</h2>
            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                { label: "Institution", value: student.institution },
                { label: "Programme", value: category?.name ?? "—" },
                { label: "Previous examination", value: student.previousExam },
                { label: "Passing year", value: String(student.passingYear) },
                { label: "Academic result", value: student.result },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[13.5px] font-medium text-ink">
                    {item.value}
                  </p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-muted">
                  Future educational goal
                </p>
                <p className="mt-1 text-[13.5px] font-medium text-ink">
                  {student.futureGoal}
                </p>
              </div>
            </div>
          </section>

          <article className="card-surface overflow-hidden">
            <div className="border-b border-border bg-brand-soft/60 p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <Quote className="mt-0.5 size-7 shrink-0 text-brand/25" />
                <div>
                  <h2 className="text-xl font-bold text-navy">
                    {firstName}&apos;s story
                  </h2>
                  <p className="mt-1 text-[12.5px] text-slate-muted">
                    Shared with permission. Some details are kept private to
                    protect the student and family.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6 p-6 sm:p-7">
              {storySections.map((section) => (
                <div key={section.key}>
                  <h3 className="flex items-center gap-2 text-[13.5px] font-bold text-navy">
                    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
                      <section.icon className="size-3.5" aria-hidden="true" />
                    </span>
                    {section.title}
                  </h3>
                  <p className="mt-2.5 pl-9 text-[13.5px] leading-[1.8] text-ink/75">
                    {student.story[section.key]}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-surface px-6 py-4 text-[11.5px] leading-relaxed text-slate-muted sm:px-7">
              <ShieldCheck className="mr-1.5 inline size-3.5 text-brand" />
              Contact numbers, family names, and private addresses are never
              displayed publicly. Only information approved by CEBBD appears on
              this page.
            </div>
          </article>

          <section className="card-surface p-6 sm:p-7">
            <h2 className="text-xl font-bold text-navy">Funding breakdown</h2>
            <p className="mt-1.5 text-[12.5px] text-slate-muted">
              Calculated only from donations verified and approved by the CEBBD
              finance team.
            </p>
            <div className="mt-5 space-y-3">
              {[
                {
                  label: "Total required",
                  value: funding.required,
                  className: "bg-surface text-navy",
                },
                {
                  label: "Amount received",
                  value: funding.raised,
                  className: "bg-brand-soft text-brand-dark",
                },
                {
                  label: "Remaining need",
                  value: funding.remaining,
                  className: "bg-amber-50 text-amber-800",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                >
                  <span className="text-[13px] text-slate-muted">{row.label}</span>
                  <span className={`rounded-lg px-2.5 py-1 text-[13.5px] font-bold ${row.className}`}>
                    {formatMoney(row.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[12px] text-slate-muted">
                <span>Funding progress</span>
                <span className="font-bold text-brand-dark">{funding.percent}%</span>
              </div>
              <FundingProgress percent={funding.percent} className="h-2.5" />
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-dashed border-border pt-4 text-[12px] text-slate-muted">
              <span>
                <strong className="font-semibold text-ink">
                  {funding.approvedDonationCount}
                </strong>{" "}
                approved donations
              </span>
              <span>
                <strong className="font-semibold text-ink">
                  {funding.supporterCount}
                </strong>{" "}
                verified supporters
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <AlertCircle className="size-3.5" />
                Pending donations are not counted
              </span>
            </div>
          </section>

          <section className="card-surface p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy">Recent supporters</h2>
              <span className="text-[11px] text-slate-muted">
                Verified donations only
              </span>
            </div>
            {recentSupporters.length > 0 ? (
              <ul className="mt-4 divide-y divide-border">
                {recentSupporters.map((supporter) => (
                  <li
                    key={supporter.id}
                    className="flex items-center gap-3 py-3.5"
                  >
                    <StudentAvatar name={supporter.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">
                        {supporter.name}
                      </p>
                      <p className="text-[11px] text-slate-muted">
                        {donationTypeLabels[supporter.type]} ·{" "}
                        {formatDate(supporter.paymentDate, "d MMM yyyy")}
                      </p>
                    </div>
                    <span className="text-[13px] font-bold text-brand-dark">
                      {formatMoney(supporter.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-border bg-surface p-6 text-center text-[12.5px] text-slate-muted">
                No verified donations yet. Be the first to support {firstName}.
              </p>
            )}
            <p className="mt-4 rounded-lg bg-surface px-3 py-2.5 text-[11px] leading-relaxed text-slate-muted">
              Donors appear as &quot;Anonymous Supporter&quot; unless they choose
              to show their name publicly. Contact details are never displayed.
            </p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(16,42,67,0.04)]">
            <div className="bg-navy p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Support {firstName}
              </p>
              <p className="mt-1 text-[15px] font-bold">
                Choose how you would like to help
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/60">
                All payments are made manually and verified by our team.
              </p>
            </div>
            <div className="space-y-2.5 p-4">
              {supportOptions.map((option) => (
                <Link
                  key={option.type}
                  href={`/students/${student.slug}/donate?type=${option.type}`}
                  className={
                    option.recommended
                      ? "group relative block rounded-xl border-2 border-brand bg-brand-soft p-3 transition-colors hover:border-brand-dark"
                      : "group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/30 hover:bg-brand-soft"
                  }
                >
                  {option.recommended ? (
                    <>
                      <span className="absolute -top-2 right-3 rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Most popular
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                          <option.icon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-bold text-navy">
                            {option.label}
                          </p>
                          <p className="text-[12.5px] font-extrabold text-brand-dark">
                            {option.amount}
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-brand" />
                      </div>
                      {option.tiers.length > 1 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {option.tiers.map((tier, index) => (
                            <span
                              key={tier}
                              className="rounded-full border border-brand/20 bg-white px-2 py-1 text-[10.5px] font-semibold text-brand-dark"
                            >
                              {formatMoney(tier)}
                              {index === 0 ? " full" : " partial"}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
                        <option.icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-ink">
                          {option.label}
                        </p>
                        <p className="text-[11.5px] font-bold text-brand-dark">
                          {option.amount}
                        </p>
                        <p className="text-[10.5px] text-slate-muted">
                          {option.description}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                    </>
                  )}
                </Link>
              ))}
            </div>
            <div className="border-t border-border bg-surface px-4 py-3 text-[10.5px] leading-relaxed text-slate-muted">
              Amounts are configured by the CEBBD admin team and may be updated.
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="text-[15px] font-bold text-navy">
              Have a question about {firstName}?
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-muted">
              Signed-in donors can message our support team, who reply on behalf
              of the student.
            </p>
            <div className="mt-4 space-y-2">
              <MessageStudentButton
                studentId={student.id}
                studentName={student.fullName}
                className="w-full"
              />
              <ShareProfileButton name={student.fullName} />
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="flex items-center gap-2 text-[13px] font-bold text-navy">
              <ShieldCheck className="size-4 text-brand" />
              How we protect this student
            </h3>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-slate-muted">
              <li>• Application and academic documents verified by CEBBD.</li>
              <li>• Private contact details and family information withheld.</li>
              <li>• Approved funds paid directly to the institution.</li>
              <li>• Only admin-approved donations count toward progress.</li>
            </ul>
          </div>
        </aside>
      </div>

      {relatedStudents.length > 0 && (
        <section className="border-t border-border bg-white py-12 sm:py-16">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">More students</p>
                <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
                  Other {category?.name.toLowerCase()} applicants
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/students">
                  View all students
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedStudents.map((related) => (
                <StudentCard
                  key={related.id}
                  student={related}
                  funding={fundingForStudent(related, totals)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
