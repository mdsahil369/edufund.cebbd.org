"use client";

import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Heart,
  MapPin,
  MessageSquare,
  Search,
} from "lucide-react";
import { StudentAvatar } from "@/components/students/student-avatar";
import { FundingProgress } from "@/components/students/funding-progress";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/lib/store/demo-store";
import { formatBDT, formatDate } from "@/lib/utils";

export function SupportedStudents() {
  const { session, hydrated, donations, students, fundingFor } = useDemoData();

  if (!hydrated || !session) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    );
  }

  const approved = donations.filter(
    (donation) =>
      donation.donorId === session.donorId && donation.status === "approved",
  );

  const studentIds = [...new Set(approved.map((donation) => donation.studentId))];
  const supported = studentIds
    .map((id) => {
      const student = students.find((item) => item.id === id);
      if (!student) return null;
      const myDonations = approved
        .filter((donation) => donation.studentId === id)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        );
      return {
        student,
        total: myDonations.reduce((sum, donation) => sum + donation.amount, 0),
        lastSupport: myDonations[0]?.submittedAt,
        count: myDonations.length,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supported Students"
        description="Students you have supported with at least one verified donation. Your name is only shown publicly if you enable it in privacy settings."
        action={
          <Button asChild>
            <Link href="/students">
              <Heart className="size-4" />
              Support another student
            </Link>
          </Button>
        }
      />

      {supported.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <EmptyState
            icon={Search}
            title="No supported students yet"
            description="Once a donation is verified by the CEBBD team, the student will appear here so you can follow their progress."
            action={
              <Button asChild>
                <Link href="/students">Browse student profiles</Link>
              </Button>
            }
            className="border-0 bg-surface py-16"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-brand/15 bg-brand-soft px-4 py-3 text-[12px] text-brand-dark">
            <span className="flex items-center gap-1.5 font-semibold">
              <GraduationCap className="size-4" />
              {supported.length} {supported.length === 1 ? "student" : "students"}{" "}
              supported
            </span>
            <span className="text-slate-muted">
              {formatBDT(
                supported.reduce((sum, item) => sum + item.total, 0),
              )}{" "}
              in verified donations
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {supported.map(({ student, total, lastSupport, count }) => {
              const funding = fundingFor(student.id);
              return (
                <article
                  key={student.id}
                  className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <StudentAvatar name={student.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[14px] font-bold text-navy">
                        {student.fullName}
                      </h2>
                      <p className="truncate text-[11.5px] text-slate-muted">
                        {student.institution}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[10.5px] text-slate-muted">
                        <MapPin className="size-3" />
                        {student.district}, {student.division}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-surface px-3 py-2.5">
                    <div>
                      <p className="text-[10px] text-slate-muted">Your support</p>
                      <p className="text-[13px] font-bold text-brand-dark">
                        {formatBDT(total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-muted">
                        {count === 1 ? "1 donation" : `${count} donations`}
                      </p>
                      <p className="text-[11px] font-medium text-ink">
                        {lastSupport ? formatDate(lastSupport) : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-muted">Campaign progress</span>
                      <span className="font-bold text-ink">{funding.percent}%</span>
                    </div>
                    <FundingProgress percent={funding.percent} className="mt-1.5" />
                    <p className="mt-1 text-[10px] text-slate-muted">
                      {formatBDT(funding.raised)} raised of{" "}
                      {formatBDT(funding.required)}
                    </p>
                  </div>

                  <div className="mt-auto flex gap-2 pt-4">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/students/${student.slug}`}>View profile</Link>
                    </Button>
                    <Button asChild variant="soft" size="sm" className="flex-1">
                      <Link href="/dashboard/messages">
                        <MessageSquare className="size-3.5" />
                        Message
                      </Link>
                    </Button>
                  </div>
                  <Button asChild size="xs" className="mt-2 w-full">
                    <Link href={`/students/${student.slug}/donate`}>
                      Support again
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
