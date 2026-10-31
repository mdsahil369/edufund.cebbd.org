import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, LockKeyhole } from "lucide-react";
import { DonationWizard } from "@/components/donations/donation-wizard";
import { StudentAvatar } from "@/components/students/student-avatar";
import {
  getPublishedStudentSlugs,
  getStudentBySlug,
} from "@/lib/services/students";
import { getCategoryName } from "@/lib/mock-data/categories";
import { donations } from "@/lib/mock-data/donations";
import { getFunding, formatBDT } from "@/lib/utils";
import { toPublicStudent } from "@/lib/students";

export async function generateStaticParams() {
  const slugs = await getPublishedStudentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/students/[slug]/donate">): Promise<Metadata> {
  const { slug } = await params;
  const student = await getStudentBySlug(slug);
  if (!student) return { title: "Support a student" };
  return {
    title: `Support ${student.fullName}`,
    description: `Make a manual donation toward ${student.fullName}'s education. All payments are verified by the CEBBD finance team before they are added to the campaign.`,
    alternates: { canonical: `/students/${student.slug}/donate` },
    robots: { index: false, follow: true },
  };
}

function DonationSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="h-[520px] animate-pulse rounded-2xl border border-border bg-white" />
      <div className="h-[340px] animate-pulse rounded-2xl border border-border bg-white" />
    </div>
  );
}

export default async function DonatePage({
  params,
}: PageProps<"/students/[slug]/donate">) {
  const { slug } = await params;
  const student = await getStudentBySlug(slug);
  if (!student) notFound();

  const publicStudent = toPublicStudent(student);
  const funding = getFunding(student, donations);
  const categoryName = getCategoryName(student.categoryId);

  return (
    <div className="min-h-screen bg-surface">
      <section className="border-b border-border bg-white">
        <div className="container-page py-6 sm:py-8">
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
            <Link
              href={`/students/${student.slug}`}
              className="transition-colors hover:text-brand"
            >
              {student.fullName}
            </Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span className="font-medium text-ink">Donate</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Manual donation</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                Support {student.fullName}
              </h1>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-slate-muted">
                Choose a support type, make a manual payment, and submit the
                transaction details. Your donation stays pending until the CEBBD
                team verifies it.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 sm:min-w-[280px]">
              <StudentAvatar name={student.fullName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-navy">
                  {student.fullName}
                </p>
                <p className="truncate text-[11px] text-slate-muted">
                  {categoryName} · {student.district}
                </p>
                <p className="mt-0.5 text-[10.5px] text-slate-muted">
                  {formatBDT(funding.remaining)} still needed
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-muted">
            <LockKeyhole className="size-3.5 text-brand" />
            No online payment gateway is used. This is a frontend prototype; no
            real money is transferred.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <Suspense fallback={<DonationSkeleton />}>
          <DonationWizard student={publicStudent} funding={funding} />
        </Suspense>
      </div>
    </div>
  );
}
