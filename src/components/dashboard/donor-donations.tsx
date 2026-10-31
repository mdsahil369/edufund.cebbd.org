"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HandCoins,
  Receipt,
  Search,
  XCircle,
} from "lucide-react";
import { StudentAvatar } from "@/components/students/student-avatar";
import { StatusPill, donationStatusTone } from "@/components/shared/status-pill";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDemoData } from "@/lib/store/demo-store";
import type { Donation, DonationStatus } from "@/types";
import {
  cn,
  donationStatusLabels,
  donationTypeLabels,
  formatBDT,
  formatDate,
  formatDateTime,
  paymentMethodLabels,
} from "@/lib/utils";

type StatusFilter = DonationStatus | "all";

const filters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All donations" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function DonorDonations() {
  const { session, hydrated, donations, students } = useDemoData();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Donation | null>(null);

  const myDonations = useMemo(
    () =>
      donations
        .filter((donation) => donation.donorId === session?.donorId)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        ),
    [donations, session?.donorId],
  );

  const counts = useMemo(
    () => ({
      all: myDonations.length,
      pending: myDonations.filter((item) => item.status === "pending").length,
      approved: myDonations.filter((item) => item.status === "approved").length,
      rejected: myDonations.filter((item) => item.status === "rejected").length,
    }),
    [myDonations],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return myDonations.filter((donation) => {
      if (status !== "all" && donation.status !== status) return false;
      if (!query) return true;
      const student = students.find((item) => item.id === donation.studentId);
      const haystack = [
        student?.fullName ?? "",
        donation.receiptNumber,
        donation.transactionId,
        donation.senderReference,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [myDonations, status, search, students]);

  const approvedTotal = myDonations
    .filter((donation) => donation.status === "approved")
    .reduce((total, donation) => total + donation.amount, 0);

  if (!hydrated || !session) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Donations"
        description="Every donation you submit is listed here with its payment and verification status. Only approved donations count toward a student's campaign."
        action={
          <Button asChild>
            <Link href="/students">
              Make a donation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Verified total"
          value={formatBDT(approvedTotal)}
          icon={CheckCircle2}
          hint={`${counts.approved} approved donations`}
          tone="brand"
        />
        <StatCard
          label="Awaiting verification"
          value={String(counts.pending)}
          icon={Clock3}
          hint="Typically reviewed in 1–2 business days"
        />
        <StatCard
          label="Rejected submissions"
          value={String(counts.rejected)}
          icon={XCircle}
          hint="Review notes are shown in the details"
        />
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                  status === filter.value
                    ? "bg-brand text-white"
                    : "bg-muted text-slate-muted hover:bg-brand-light hover:text-brand-dark",
                )}
              >
                {filter.label}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 text-[10px]",
                    status === filter.value ? "bg-white/20" : "bg-white",
                  )}
                >
                  {counts[filter.value]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search receipt, student, txn ID…"
              aria-label="Search donations"
              className="h-9 pl-9 text-[12.5px]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={HandCoins}
              title={
                myDonations.length === 0
                  ? "You have not made a donation yet"
                  : "No donations match this view"
              }
              description={
                myDonations.length === 0
                  ? "Browse verified student profiles and support a student's education today."
                  : "Try a different status filter or search term."
              }
              action={
                myDonations.length === 0 ? (
                  <Button asChild size="sm">
                    <Link href="/students">Browse students</Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatus("all");
                      setSearch("");
                    }}
                  >
                    Clear filters
                  </Button>
                )
              }
              className="border-0 bg-surface"
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <div className="grid grid-cols-[1.2fr_1.1fr_0.9fr_0.8fr_0.9fr_0.7fr] gap-3 border-b border-border bg-surface px-5 py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-muted">
                <span>Donation</span>
                <span>Student</span>
                <span>Type</span>
                <span>Amount</span>
                <span>Payment</span>
                <span>Verification</span>
              </div>
              <ul className="divide-y divide-border">
                {filtered.map((donation) => {
                  const student = students.find(
                    (item) => item.id === donation.studentId,
                  );
                  return (
                    <li key={donation.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(donation)}
                        className="grid w-full grid-cols-[1.2fr_1.1fr_0.9fr_0.8fr_0.9fr_0.7fr] items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface"
                      >
                        <div>
                          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                            <Receipt className="size-3.5 text-slate-muted" />
                            {donation.receiptNumber}
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-slate-muted">
                            {formatDate(donation.submittedAt)}
                          </p>
                        </div>
                        <div className="flex min-w-0 items-center gap-2">
                          <StudentAvatar
                            name={student?.fullName ?? "Student"}
                            size="xs"
                          />
                          <span className="truncate text-[12px] font-medium text-ink">
                            {student?.fullName ?? "Student"}
                          </span>
                        </div>
                        <span className="text-[11.5px] text-slate-muted">
                          {donationTypeLabels[donation.type]}
                        </span>
                        <span className="text-[12.5px] font-bold text-ink">
                          {formatBDT(donation.amount)}
                        </span>
                        <span className="text-[11.5px] text-slate-muted">
                          {donation.status === "approved"
                            ? "Received"
                            : donation.status === "rejected"
                              ? "Not verified"
                              : "Submitted"}
                        </span>
                        <StatusPill tone={donationStatusTone(donation.status)}>
                          {donationStatusLabels[donation.status]}
                        </StatusPill>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="divide-y divide-border lg:hidden">
              {filtered.map((donation) => {
                const student = students.find(
                  (item) => item.id === donation.studentId,
                );
                return (
                  <li key={donation.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(donation)}
                      className="w-full px-4 py-4 text-left transition-colors hover:bg-surface"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <StudentAvatar
                            name={student?.fullName ?? "Student"}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-ink">
                              {student?.fullName ?? "Student"}
                            </p>
                            <p className="text-[10.5px] text-slate-muted">
                              {donation.receiptNumber} ·{" "}
                              {formatDate(donation.submittedAt)}
                            </p>
                          </div>
                        </div>
                        <StatusPill tone={donationStatusTone(donation.status)}>
                          {donationStatusLabels[donation.status]}
                        </StatusPill>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
                        <span className="text-slate-muted">
                          {donationTypeLabels[donation.type]} ·{" "}
                          {paymentMethodLabels[donation.method]}
                        </span>
                        <span className="font-bold text-ink">
                          {formatBDT(donation.amount)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Donation details</DialogTitle>
                <DialogDescription>
                  Submitted {formatDateTime(selected.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                  <div>
                    <p className="text-[11px] text-slate-muted">Amount</p>
                    <p className="text-xl font-extrabold text-navy">
                      {formatBDT(selected.amount)}
                    </p>
                  </div>
                  <StatusPill tone={donationStatusTone(selected.status)}>
                    {donationStatusLabels[selected.status]}
                  </StatusPill>
                </div>

                <dl className="space-y-2.5 text-[12.5px]">
                  {[
                    ["Receipt number", selected.receiptNumber],
                    [
                      "Student",
                      students.find((item) => item.id === selected.studentId)
                        ?.fullName ?? "Student",
                    ],
                    ["Support type", donationTypeLabels[selected.type]],
                    ["Payment method", paymentMethodLabels[selected.method]],
                    ["Transaction ID", selected.transactionId],
                    ["Sender reference", selected.senderReference],
                    ["Payment date", formatDate(selected.paymentDate)],
                    [
                      "Payment status",
                      selected.status === "approved"
                        ? "Received"
                        : selected.status === "rejected"
                          ? "Not verified"
                          : "Submitted",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-dashed border-border pb-2.5 last:border-0"
                    >
                      <dt className="text-slate-muted">{label}</dt>
                      <dd className="text-right font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>

                {selected.message && (
                  <div className="rounded-lg bg-surface p-3 text-[12px] leading-relaxed text-slate-muted">
                    <p className="mb-1 font-semibold text-ink">Your message</p>
                    {selected.message}
                  </div>
                )}

                {selected.reviewNote && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] leading-relaxed text-red-700">
                    <p className="mb-1 font-semibold">Review note</p>
                    {selected.reviewNote}
                  </div>
                )}

                {selected.status === "pending" && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11.5px] leading-relaxed text-amber-800">
                    This donation is awaiting verification. It will not increase the
                    student&apos;s public campaign total until it is approved.
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
