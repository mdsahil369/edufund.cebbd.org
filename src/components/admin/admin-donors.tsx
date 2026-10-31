"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
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
import { useDemoData } from "@/lib/store/demo-store";
import type { Donor } from "@/types";
import {
  donationStatusLabels,
  donationTypeLabels,
  formatBDT,
  formatDate,
} from "@/lib/utils";

export function AdminDonors() {
  const { hydrated, donors, donations, students } = useDemoData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Donor | null>(null);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const donorStats = donors.map((donor) => {
    const donorDonations = donations.filter(
      (donation) => donation.donorId === donor.id,
    );
    const approved = donorDonations.filter(
      (donation) => donation.status === "approved",
    );
    return {
      donor,
      total: approved.reduce((sum, donation) => sum + donation.amount, 0),
      approvedCount: approved.length,
      pendingCount: donorDonations.filter(
        (donation) => donation.status === "pending",
      ).length,
      donationCount: donorDonations.length,
    };
  });

  const filtered = donorStats
    .filter(({ donor, approvedCount, donationCount }) => {
      if (filter === "donated" && approvedCount === 0) return false;
      if (filter === "anonymous" && donor.showNamePublicly) return false;
      if (filter === "no-donations" && donationCount > 0) return false;
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return [donor.fullName, donor.email, donor.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => b.total - a.total);

  const totalVerified = donorStats.reduce((sum, item) => sum + item.total, 0);
  const donorsWithDonations = donorStats.filter(
    (item) => item.approvedCount > 0,
  ).length;
  const anonymousCount = donors.filter(
    (donor) => !donor.showNamePublicly,
  ).length;

  const selectedStats = selected
    ? donorStats.find((item) => item.donor.id === selected.id)
    : undefined;
  const selectedDonations = selected
    ? donations
        .filter((donation) => donation.donorId === selected.id)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime(),
        )
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donors"
        description="View donor accounts, contact details, and verified giving history. Contact information is visible to admins only and is never shown publicly."
        action={
          <div className="inline-flex items-center gap-2 rounded-lg border border-brand/15 bg-brand-soft px-3 py-2 text-[11.5px] text-brand-dark">
            <ShieldCheck className="size-4" />
            Admin-only records
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Registered donors"
          value={String(donors.length)}
          icon={HeartHandshake}
          hint={`${donorsWithDonations} have made verified donations`}
          tone="brand"
        />
        <StatCard
          label="Verified giving"
          value={formatBDT(totalVerified)}
          icon={UserRound}
          hint="Across all donor accounts"
        />
        <StatCard
          label="Anonymous donors"
          value={String(anonymousCount)}
          icon={Eye}
          hint="Names hidden on public pages"
        />
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search donor name, email, phone…"
              aria-label="Search donors"
              className="h-9 pl-9 text-[12.5px]"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 text-[12px] sm:w-52" aria-label="Filter donors">
              <SelectValue placeholder="Filter donors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All donors</SelectItem>
              <SelectItem value="donated">Has verified donations</SelectItem>
              <SelectItem value="anonymous">Anonymous donors</SelectItem>
              <SelectItem value="no-donations">No donations yet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={HeartHandshake}
              title="No donors match this view"
              description="Try a different search term or filter."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              }
              className="border-0 bg-surface"
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <div className="grid grid-cols-[1.6fr_1fr_0.8fr_1fr_1fr_0.9fr_64px] gap-3 border-b border-border bg-surface px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-muted">
                <span>Donor</span>
                <span>Contact</span>
                <span>Donations</span>
                <span>Verified total</span>
                <span>Public identity</span>
                <span>Status</span>
                <span className="sr-only">Action</span>
              </div>
              <ul className="divide-y divide-border">
                {filtered.map(({ donor, total, approvedCount, pendingCount }) => (
                  <li
                    key={donor.id}
                    className="grid grid-cols-[1.6fr_1fr_0.8fr_1fr_1fr_0.9fr_64px] items-center gap-3 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <StudentAvatar
                        name={donor.fullName}
                        photoUrl={donor.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-ink">
                          {donor.fullName}
                        </p>
                        <p className="truncate text-[10px] text-slate-muted">
                          Joined {formatDate(donor.joinedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0 text-[10.5px] text-slate-muted">
                      <p className="truncate">{donor.email}</p>
                      <p className="truncate">{donor.phone ?? "No phone"}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-ink">
                        {approvedCount}
                      </p>
                      {pendingCount > 0 && (
                        <p className="text-[9.5px] text-amber-600">
                          {pendingCount} pending
                        </p>
                      )}
                    </div>
                    <p className="text-[12px] font-bold text-ink">
                      {formatBDT(total)}
                    </p>
                    <StatusPill
                      tone={donor.showNamePublicly ? "brand" : "neutral"}
                      className="w-fit py-0.5 text-[10px]"
                    >
                      {donor.showNamePublicly ? "Name shown" : "Anonymous"}
                    </StatusPill>
                    <StatusPill
                      tone={donor.status === "active" ? "success" : "danger"}
                      className="w-fit py-0.5 text-[10px]"
                    >
                      {donor.status === "active" ? "Active" : "Suspended"}
                    </StatusPill>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setSelected(donor)}
                    >
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="divide-y divide-border lg:hidden">
              {filtered.map(({ donor, total, approvedCount, pendingCount }) => (
                <li key={donor.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <StudentAvatar
                      name={donor.fullName}
                      photoUrl={donor.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">
                        {donor.fullName}
                      </p>
                      <p className="truncate text-[10.5px] text-slate-muted">
                        {donor.email}
                      </p>
                      <p className="truncate text-[10.5px] text-slate-muted">
                        {donor.phone ?? "No phone on file"}
                      </p>
                    </div>
                    <StatusPill
                      tone={donor.showNamePublicly ? "brand" : "neutral"}
                      className="py-0.5 text-[9.5px]"
                    >
                      {donor.showNamePublicly ? "Name shown" : "Anonymous"}
                    </StatusPill>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-muted">
                      {approvedCount} approved ·{" "}
                      {pendingCount > 0 ? `${pendingCount} pending` : "no pending"}
                    </span>
                    <span className="font-bold text-ink">{formatBDT(total)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    className="mt-2.5 w-full"
                    onClick={() => setSelected(donor)}
                  >
                    View donor
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          {selected && selectedStats && (
            <>
              <DialogHeader>
                <DialogTitle>Donor details</DialogTitle>
                <DialogDescription>
                  Admin-only view. Contact details are never published.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
                <StudentAvatar
                  name={selected.fullName}
                  photoUrl={selected.avatarUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-navy">
                    {selected.fullName}
                  </p>
                  <p className="truncate text-[11.5px] text-slate-muted">
                    {selected.email}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <StatusPill
                      tone={selected.status === "active" ? "success" : "danger"}
                      className="py-0.5 text-[9.5px]"
                    >
                      {selected.status === "active" ? "Active" : "Suspended"}
                    </StatusPill>
                    <StatusPill
                      tone={selected.showNamePublicly ? "brand" : "neutral"}
                      className="py-0.5 text-[9.5px]"
                    >
                      {selected.showNamePublicly ? "Name shown" : "Anonymous"}
                    </StatusPill>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border p-2.5 text-center">
                  <p className="text-[9.5px] text-slate-muted">Verified</p>
                  <p className="text-[13px] font-bold text-brand-dark">
                    {formatBDT(selectedStats.total)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-2.5 text-center">
                  <p className="text-[9.5px] text-slate-muted">Approved</p>
                  <p className="text-[13px] font-bold text-ink">
                    {selectedStats.approvedCount}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-2.5 text-center">
                  <p className="text-[9.5px] text-slate-muted">Pending</p>
                  <p className="text-[13px] font-bold text-amber-600">
                    {selectedStats.pendingCount}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-border p-3 text-[11.5px]">
                <p className="flex items-center gap-2 text-slate-muted">
                  <Mail className="size-3.5" />
                  {selected.email}
                </p>
                <p className="flex items-center gap-2 text-slate-muted">
                  <Phone className="size-3.5" />
                  {selected.phone ?? "No phone on file"}
                </p>
                <p className="flex items-center gap-2 text-slate-muted">
                  <MapPin className="size-3.5" />
                  {selected.address ?? "No address on file"}
                </p>
                <p className="text-slate-muted">
                  Joined {formatDate(selected.joinedAt, "d MMMM yyyy")}
                </p>
              </div>

              {selected.bio && (
                <p className="rounded-lg bg-surface p-3 text-[11.5px] leading-relaxed text-slate-muted">
                  {selected.bio}
                </p>
              )}

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-muted">
                  Donation history
                </p>
                {selectedDonations.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border py-6 text-center text-[11.5px] text-slate-muted">
                    This donor has not submitted a donation yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {selectedDonations.slice(0, 8).map((donation) => {
                      const student = students.find(
                        (item) => item.id === donation.studentId,
                      );
                      return (
                        <li
                          key={donation.id}
                          className="flex items-center gap-2.5 px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11.5px] font-semibold text-ink">
                              {student?.fullName ?? "Student"}
                            </p>
                            <p className="text-[9.5px] text-slate-muted">
                              {donationTypeLabels[donation.type]} ·{" "}
                              {formatDate(donation.submittedAt)}
                            </p>
                          </div>
                          <p className="text-[11.5px] font-bold text-ink">
                            {formatBDT(donation.amount)}
                          </p>
                          <StatusPill
                            tone={donationStatusTone(donation.status)}
                            className="py-0.5 text-[9px]"
                          >
                            {donationStatusLabels[donation.status]}
                          </StatusPill>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {selectedDonations.length > 8 && (
                  <Button asChild variant="ghost" size="sm" className="mt-1 w-full">
                    <Link href="/admin/donations">
                      View all donations
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
