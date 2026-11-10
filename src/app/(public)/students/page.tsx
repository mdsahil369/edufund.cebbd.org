import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { StudentDirectory } from "@/components/students/student-directory";
import { getPublishedStudents, getEducationCategories, getDistricts } from "@/lib/services/students";
import { fundingForStudent, getFundingTotals } from "@/lib/services/funding";
import { formatMoney } from "@/lib/utils";
import { toPublicStudents } from "@/lib/students";

// Student data lives in Supabase and can change at any time.
export const instant = false;

export const metadata: Metadata = {
  title: "Student Archive",
  description:
    "Browse verified student profiles from across Bangladesh. Filter by education category, district, and campaign status to find a student you can support.",
  alternates: { canonical: "/students" },
  openGraph: {
    title: "Student Archive | EduFund CEBBD",
    description:
      "Browse verified student profiles and support a student's education today.",
  },
};

export default async function StudentsPage() {
  const [students, categories, districts, totals] = await Promise.all([
    getPublishedStudents(),
    getEducationCategories(),
    getDistricts(),
    getFundingTotals(),
  ]);

  const publicStudents = toPublicStudents(students);
  const fundingById = Object.fromEntries(
    publicStudents.map((student) => [
      student.id,
      fundingForStudent(student, totals),
    ]),
  );
  const totalRemaining = Object.values(fundingById).reduce(
    (total, funding) => total + funding.remaining,
    0,
  );
  const diplomaCount = publicStudents.filter(
    (student) => student.categoryId === "cat-diploma",
  ).length;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="pattern-dots absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute -top-32 right-0 size-96 rounded-full bg-brand-light/60 blur-3xl"
          aria-hidden="true"
        />
        <div className="container-page relative py-10 sm:py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-muted">
            <Link href="/" className="transition-colors hover:text-brand">
              Home
            </Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span className="font-medium text-ink">Student Archive</span>
          </nav>

          <p className="eyebrow mt-6">Student archive</p>
          <h1 className="mt-3 max-w-3xl text-3xl leading-[1.1] font-extrabold tracking-tight text-navy sm:text-4xl lg:text-[2.8rem]">
            Students waiting for a chance to continue
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-muted sm:text-[15px]">
            Every profile below has been reviewed by the CEBBD team. Browse by
            education category, district, or campaign status, and support the
            student whose story speaks to you.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12.5px] text-slate-muted">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-brand" aria-hidden="true" />
              <strong className="font-semibold text-ink">
                {publicStudents.length}
              </strong>{" "}
              published profiles
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-4 text-brand" aria-hidden="true" />
              <strong className="font-semibold text-ink">{diplomaCount}</strong>{" "}
              diploma scholars
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
              <strong className="font-semibold text-ink">
                {formatMoney(totalRemaining)}
              </strong>{" "}
              still needed across all campaigns
            </span>
          </div>
        </div>
      </section>

      <section className="bg-surface py-10 sm:py-12">
        <div className="container-page">
          <StudentDirectory
            students={publicStudents}
            categories={categories}
            districts={districts}
            fundingById={fundingById}
          />
        </div>
      </section>
    </>
  );
}
