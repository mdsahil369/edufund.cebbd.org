"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HandCoins,
  Receipt,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/student-avatar";
import { StatusPill, donationStatusTone } from "@/components/shared/status-pill";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/lib/store/demo-store";
import type { Donation, DonationStatus, PaymentMethodId } from "@/types";
import {
  cn,
  donationStatusLabels,
  donationTypeLabels,
  formatBDT,
  formatDate,
  formatDateTime,
  paymentMethodLabels,
} from "@/lib/utils";

const statusFilters: { value: DonationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function AdminDonations() {
  const {
    hydrated,
    donations,
    donors,
    students,
    approveDonation,
    rejectDonation,
  } = useDemoData();

  const [status, setStatus] = useState<DonationStatus | "all">("pending");
  const [method, setMethod] = useState<PaymentMethodId | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Donation | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const sorted = useMemo(
    () =>
      [...donations].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      ),
    [donations],
  );

  const counts = useMemo(
    () => ({
      all: donations.length,
      pending: donations.filter((donation) => donation.status === "pending")
        .length,
      approved: donations.filter((donation) => donation.status === "approved")
        .length,
      rejected: donations.filter((donation) => donation.status === "rejected")
        .length,
    }),
    [donations],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sorted.filter((donation) => {
      if (status !== "all" && donation.status !== status) return false;
      if (method !== "all" && donation.method !== method) return false;
      if (!query) return true;
      const donor = donors.find((item) => item.id === donation.donorId);
      const student = students.find((item) => item.id === donation.studentId);
      return [
        donation.receiptNumber,
        donation.transactionId,
        donation.senderReference,
        donor?.fullName ?? "",
        donor?.email ?? "",
        student?.fullName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [sorted, status, method, search, donors, students]);

  if (!hydrated) {
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

  const pendingAmount = donations
    .filter((donation) => donation.status === "pending")
    .reduce((sum, donation) => sum + donation.amount, 0);
  const approvedAmount = donations
    .filter((donation) => donation.status === "approved")
    .reduce((sum, donation) => sum + donation.amount, 0);

  const openReview = (donation: Donation) => {
    setSelected(donation);
    setReviewNote(donation.reviewNote ?? "");
  };

  const approve = () => {
    if (!selected) return;
    approveDonation(selected.id);
    toast.success(
      `${formatBDT(selected.amount)} approved and added to the campaign total.`,
    );
    setSelected(null);
  };

  const reject = () => {
    if (!selected) return;
    if (!reviewNote.trim()) {
      toast.error("Add a review note before rejecting a donation.");
      return;
    }
    rejectDonation(selected.id, reviewNote.trim());
    toast.success("Donation rejected. The donor can see the review note.");
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donations"
        description="Verify manual payments before they count toward a student's campaign. Only approved donations are included in public funding totals."
        action={
          <div className="inline-flex items-center gap-2 rounded-lg border border-brand/15 bg-brand-soft px-3 py-2 text-[11.5px] text-brand-dark">
            <ShieldCheck className="size-4" />
            Manual verification workflow
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending review"
          value={String(counts.pending)}
          icon={Clock3}
          hint={`${formatBDT(pendingAmount)} awaiting verification`}
        />
        <StatCard
          label="Verified total"
          value={formatBDT(approvedAmount)}
          icon={CheckCircle2}
          hint={`${counts.approved} approved donations`}
          tone="brand"
        />
        <StatCard
          label="Rejected"
          value={String(counts.rejected)}
          icon={XCircle}
          hint="Not counted toward campaigns"
        />
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4">
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((filter) => (
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search receipt, donor, student, transaction ID…"
                aria-label="Search donations"
                className="h-9 pl-9 text-[12.5px]"
              />
            </div>
            <Select
              value={method}
              onValueChange={(value) => setMethod(value as PaymentMethodId | "all")}
            >
              <SelectTrigger className="h-9 text-[12px] sm:w-48" aria-label="Filter by payment method">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="bank-transfer">Bank transfer</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={HandCoins}
              title={
                status === "pending"
                  ? "No donations waiting for review"
                  : "No donations match this view"
              }
              description={
                status === "pending"
                  ? "All submitted payments have been reviewed. New submissions will appear here."
                  : "Try a different status, payment method, or search term."
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatus("all");
                    setMethod("all");
                    setSearch("");
                  }}
                >
                  Show all donations
                </Button>
              }
              className="border-0 bg-surface"
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <div className="grid grid-cols-[1.2fr_1.2fr_1.2fr_0.9fr_0.9fr_0.9fr_80px] gap-3 border-b border-border bg-surface px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-muted">
                <span>Donation</span>
                <span>Donor</span>
                <span>Student</span>
                <span>Amount</span>
                <span>Method</span>
                <span>Status</span>
                <span className="sr-only">Action</span>
              </div>
              <ul className="divide-y divide-border">
                {filtered.map((donation) => {
                  const donor = donors.find(
                    (item) => item.id === donation.donorId,
                  );
                  const student = students.find(
                    (item) => item.id === donation.studentId,
                  );
                  return (
                    <li
                      key={donation.id}
                      className="grid grid-cols-[1.2fr_1.2fr_1.2fr_0.9fr_0.9fr_0.9fr_80px] items-center gap-3 px-5 py-3"
                    >
                      <div>
                        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink">
                          <Receipt className="size-3.5 text-slate-muted" />
                          {donation.receiptNumber}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-muted">
                          {formatDate(donation.submittedAt)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-medium text-ink">
                          {donor?.fullName ?? "Unknown donor"}
                        </p>
                        <p className="truncate text-[10px] text-slate-muted">
                          {donor?.email ?? "—"}
                        </p>
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <StudentAvatar
                          name={student?.fullName ?? "Student"}
                          size="xs"
                        />
                        <span className="truncate text-[11.5px] text-ink">
                          {student?.fullName ?? "Student"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-ink">
                          {formatBDT(donation.amount)}
                        </p>
                        <p className="text-[9.5px] text-slate-muted">
                          {donationTypeLabels[donation.type]}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-muted">
                        {paymentMethodLabels[donation.method]}
                      </span>
                      <StatusPill
                        tone={donationStatusTone(donation.status)}
                        className="w-fit py-0.5 text-[10px]"
                      >
                        {donationStatusLabels[donation.status]}
                      </StatusPill>
                      <Button
                        variant={donation.status === "pending" ? "soft" : "ghost"}
                        size="xs"
                        onClick={() => openReview(donation)}
                      >
                        {donation.status === "pending" ? "Review" : "View"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="divide-y divide-border lg:hidden">
              {filtered.map((donation) => {
                const donor = donors.find(
                  (item) => item.id === donation.donorId,
                );
                const student = students.find(
                  (item) => item.id === donation.studentId,
                );
                return (
                  <li key={donation.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <StudentAvatar
                          name={student?.fullName ?? "Student"}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold text-ink">
                            {student?.fullName ?? "Student"}
                          </p>
                          <p className="truncate text-[10px] text-slate-muted">
                            {donor?.fullName ?? "Donor"} ·{" "}
                            {donation.receiptNumber}
                          </p>
                        </div>
                      </div>
                      <StatusPill
                        tone={donationStatusTone(donation.status)}
                        className="py-0.5 text-[10px]"
                      >
                        {donationStatusLabels[donation.status]}
                      </StatusPill>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <p className="text-[11px] text-slate-muted">
                        {donationTypeLabels[donation.type]} ·{" "}
                        {paymentMethodLabels[donation.method]} ·{" "}
                        {formatDate(donation.submittedAt)}
                      </p>
                      <p className="text-[13px] font-bold text-ink">
                        {formatBDT(donation.amount)}
                      </p>
                    </div>
                    <Button
                      variant={donation.status === "pending" ? "soft" : "outline"}
                      size="xs"
                      className="mt-2.5 w-full"
                      onClick={() => openReview(donation)}
                    >
                      {donation.status === "pending"
                        ? "Review donation"
                        : "View details"}
                    </Button>
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
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {selected.receiptNumber}
                  <StatusPill tone={donationStatusTone(selected.status)}>
                    {donationStatusLabels[selected.status]}
                  </StatusPill>
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDateTime(selected.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-[10px] text-slate-muted">Amount</p>
                    <p className="mt-0.5 text-xl font-extrabold text-navy">
                      {formatBDT(selected.amount)}
                    </p>
                    <p className="text-[10px] text-slate-muted">
                      {donationTypeLabels[selected.type]}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-[10px] text-slate-muted">Payment method</p>
                    <p className="mt-0.5 text-[13px] font-bold text-ink">
                      {paymentMethodLabels[selected.method]}
                    </p>
                    <p className="truncate text-[10px] text-slate-muted">
                      {selected.transactionId}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-muted">
                      Donor
                    </p>
                    {(() => {
                      const donor = donors.find(
                        (item) => item.id === selected.donorId,
                      );
                      return (
                        <>
                          <p className="mt-1 text-[12px] font-semibold text-ink">
                            {donor?.fullName ?? "Unknown donor"}
                          </p>
                          <p className="text-[10.5px] text-slate-muted">
                            {donor?.email}
                          </p>
                          <p className="text-[10.5px] text-slate-muted">
                            {donor?.phone ?? "No phone on file"}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-muted">
                      Student
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-ink">
                      {students.find((item) => item.id === selected.studentId)
                        ?.fullName ?? "Student"}
                    </p>
                    <p className="text-[10.5px] text-slate-muted">
                      {students.find((item) => item.id === selected.studentId)
                        ?.institution ?? ""}
                    </p>
                  </div>
                </div>

                <dl className="space-y-2.5 rounded-xl border border-border p-3 text-[11.5px]">
                  {[
                    ["Sender reference", selected.senderReference],
                    ["Payment date", formatDate(selected.paymentDate)],
                    ["Transaction ID", selected.transactionId],
                    [
                      "Review note",
                      selected.reviewNote ?? "No review note",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-dashed border-border pb-2 last:border-0 last:pb-0"
                    >
                      <dt className="text-slate-muted">{label}</dt>
                      <dd className="max-w-[60%] text-right font-semibold text-ink">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {selected.message && (
                  <div className="rounded-lg bg-surface p-3 text-[11.5px] leading-relaxed text-slate-muted">
                    <p className="mb-1 font-semibold text-ink">Donor message</p>
                    {selected.message}
                  </div>
                )}

                {selected.status === "pending" ? (
                  <>
                    <div>
                      <label
                        htmlFor="reviewNote"
                        className="mb-1 block text-[11.5px] font-semibold text-ink"
                      >
                        Review note{" "}
                        <span className="font-normal text-slate-muted">
                          (required if rejecting)
                        </span>
                      </label>
                      <Textarea
                        id="reviewNote"
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        rows={2}
                        placeholder="Explain any issue with the transaction, or leave a note for the donor."
                      />
                    </div>

                    <div className="rounded-lg border border-brand/15 bg-brand-soft p-3 text-[10.5px] leading-relaxed text-slate-muted">
                      Approving adds this amount to the student&apos;s public
                      campaign total and marks the payment as verified.
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button variant="outline" onClick={() => setSelected(null)}>
                        Close
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={reject}
                      >
                        <XCircle className="size-4" />
                        Reject
                      </Button>
                      <Button onClick={approve}>
                        <CheckCircle2 className="size-4" />
                        Approve donation
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
