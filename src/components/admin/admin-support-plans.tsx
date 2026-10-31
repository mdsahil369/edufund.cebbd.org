"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/student-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoData } from "@/lib/store/demo-store";
import type { Student } from "@/types";
import { getCategoryName } from "@/lib/mock-data/categories";
import { cn, formatBDT } from "@/lib/utils";

export function AdminSupportPlans() {
  const { hydrated, students } = useDemoData();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(students[0]?.id ?? "");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (!query) return true;
      return [student.fullName, student.institution, student.district]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [students, search]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-[560px] animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const selected = students.find((student) => student.id === selectedId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Plans"
        description="Set the donation amounts shown on each student's public profile. The donation flow reads these values, so amounts are never hardcoded in the interface."
        action={
          <div className="inline-flex items-center gap-2 rounded-lg border border-brand/15 bg-brand-soft px-3 py-2 text-[11.5px] text-brand-dark">
            <SlidersHorizontal className="size-4" />
            Per-student amounts
          </div>
        }
      />

      {students.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <EmptyState
            icon={GraduationCap}
            title="No students yet"
            description="Add a student first, then configure their support plans here."
            action={
              <Button asChild size="sm">
                <Link href="/admin/students">Add a student</Link>
              </Button>
            }
            className="border-0 bg-surface py-16"
          />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border p-3.5">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-muted"
                  aria-hidden="true"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students…"
                  aria-label="Search students"
                  className="h-8.5 pl-8 text-[12px]"
                />
              </div>
            </div>
            <ul className="max-h-[600px] divide-y divide-border overflow-y-auto">
              {filtered.map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(student.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-surface",
                      student.id === selectedId && "bg-brand-soft/70",
                    )}
                  >
                    <StudentAvatar
                      name={student.fullName}
                      photoUrl={student.photoUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-ink">
                        {student.fullName}
                      </p>
                      <p className="truncate text-[10px] text-slate-muted">
                        {getCategoryName(student.categoryId)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        student.visibility === "published"
                          ? "bg-emerald-500"
                          : "bg-slate-300",
                      )}
                      title={
                        student.visibility === "published"
                          ? "Published"
                          : "Unpublished"
                      }
                    />
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-4 py-8 text-center text-[11.5px] text-slate-muted">
                  No students match your search.
                </li>
              )}
            </ul>
          </aside>

          {selected ? (
            <SupportPlanForm key={selected.id} student={selected} />
          ) : (
            <div className="rounded-2xl border border-border bg-white p-8 text-center text-[12.5px] text-slate-muted shadow-sm">
              Select a student to edit their support plans.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SupportPlanForm({ student }: { student: Student }) {
  const { updateSupportPlans, fundingFor } = useDemoData();
  const [oneTime, setOneTime] = useState(
    student.supportPlans.oneTimeOptions.join(", "),
  );
  const [monthly, setMonthly] = useState(String(student.supportPlans.monthly));
  const [yearly, setYearly] = useState(String(student.supportPlans.yearly));
  const [fullScholarship, setFullScholarship] = useState(
    String(student.supportPlans.fullScholarship),
  );

  const funding = fundingFor(student.id);

  const reset = () => {
    setOneTime(student.supportPlans.oneTimeOptions.join(", "));
    setMonthly(String(student.supportPlans.monthly));
    setYearly(String(student.supportPlans.yearly));
    setFullScholarship(String(student.supportPlans.fullScholarship));
  };

  const save = () => {
    const oneTimeOptions = oneTime
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((amount) => Number.isFinite(amount) && amount >= 100);
    if (oneTimeOptions.length === 0) {
      toast.error("Add at least one one-time amount of ৳100 or more.");
      return;
    }
    const monthlyAmount = Number(monthly);
    const yearlyAmount = Number(yearly);
    const scholarshipAmount = Number(fullScholarship);
    if (
      !Number.isFinite(monthlyAmount) ||
      monthlyAmount < 100 ||
      !Number.isFinite(yearlyAmount) ||
      yearlyAmount < 100 ||
      !Number.isFinite(scholarshipAmount) ||
      scholarshipAmount < 100
    ) {
      toast.error("Monthly, yearly, and full scholarship amounts must be ৳100 or more.");
      return;
    }
    updateSupportPlans(student.id, {
      oneTimeOptions,
      monthly: monthlyAmount,
      yearly: yearlyAmount,
      fullScholarship: scholarshipAmount,
    });
    setOneTime(oneTimeOptions.join(", "));
    toast.success("Support plans updated.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <StudentAvatar
              name={student.fullName}
              photoUrl={student.photoUrl}
              size="md"
            />
            <div>
              <h2 className="text-[15px] font-bold text-navy">
                {student.fullName}
              </h2>
              <p className="text-[11.5px] text-slate-muted">
                {student.institution} · {student.district}
              </p>
              <p className="mt-0.5 text-[10.5px] text-slate-muted">
                {getCategoryName(student.categoryId)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/students/${student.slug}`}>
                Public profile
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-surface px-3 py-2.5 text-[10.5px] text-slate-muted">
          <span className="flex items-center gap-1.5">
            <Wallet className="size-3.5 text-brand" />
            {formatBDT(funding.raised)} raised of{" "}
            {formatBDT(funding.required)}
          </span>
          <span>{funding.percent}% funded</span>
          <span>{funding.supporterCount} supporters</span>
          <span>
            {student.visibility === "published" ? "Published" : "Unpublished"}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-bold text-navy">Donation amounts</h2>
          <p className="mt-0.5 text-[10.5px] text-slate-muted">
            These values appear in step 1 and step 2 of the donation flow.
          </p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="oneTimeOptions"
              className="mb-1 block text-[11.5px] font-semibold text-ink"
            >
              One-time preset amounts (৳)
            </label>
            <Input
              id="oneTimeOptions"
              value={oneTime}
              onChange={(event) => setOneTime(event.target.value)}
              placeholder="1000, 2500, 5000, 10000"
            />
            <p className="mt-1 text-[10px] text-slate-muted">
              Comma-separated. Donors can still enter a custom one-time amount.
            </p>
          </div>
          <div>
            <label
              htmlFor="monthly"
              className="mb-1 block text-[11.5px] font-semibold text-ink"
            >
              Monthly sponsorship (৳)
            </label>
            <Input
              id="monthly"
              type="number"
              value={monthly}
              onChange={(event) => setMonthly(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="yearly"
              className="mb-1 block text-[11.5px] font-semibold text-ink"
            >
              Yearly sponsorship (৳)
            </label>
            <Input
              id="yearly"
              type="number"
              value={yearly}
              onChange={(event) => setYearly(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="fullScholarship"
              className="mb-1 block text-[11.5px] font-semibold text-ink"
            >
              Full scholarship (৳)
            </label>
            <Input
              id="fullScholarship"
              type="number"
              value={fullScholarship}
              onChange={(event) => setFullScholarship(event.target.value)}
            />
          </div>
          <div className="rounded-lg border border-brand/15 bg-brand-soft p-3 text-[10.5px] leading-relaxed text-slate-muted">
            <CheckCircle2 className="mr-1 inline size-3.5 text-brand" />
            Saving updates the public profile immediately in this demo. The
            donation flow will use the new amounts on the next visit.
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-3.5 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="size-4" />
            Reset fields
          </Button>
          <Button onClick={save}>
            <Save className="size-4" />
            Save plans
          </Button>
        </div>
      </section>

      <div className="rounded-xl border border-dashed border-border bg-white px-4 py-3 text-[10.5px] leading-relaxed text-slate-muted">
        Note: the full scholarship amount is the total campaign requirement used
        for the “Full scholarship” option. Keep it aligned with the student&apos;s
        required amount unless the campaign is intentionally split into smaller
        goals.
      </div>
    </div>
  );
}
