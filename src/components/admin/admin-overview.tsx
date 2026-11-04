"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Inbox,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react";
import { format, startOfMonth, subMonths } from "date-fns";
import { StudentAvatar } from "@/components/students/student-avatar";
import { StatusPill, donationStatusTone } from "@/components/shared/status-pill";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DonationTrendChart, MethodDonut } from "@/components/admin/charts";
import { useDemoData } from "@/lib/store/demo-store";
import {
  donationStatusLabels,
  donationTypeLabels,
  formatBDT,
  timeAgo,
} from "@/lib/utils";

export function AdminOverview() {
  const {
    session,
    hydrated,
    students,
    donors,
    donations,
    conversations,
    messages,
    fundingFor,
    unreadAdminCount,
  } = useDemoData();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const approved = donations.filter(
    (donation) => donation.status === "approved",
  );
  const pending = donations
    .filter((donation) => donation.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  const totalRaised = approved.reduce(
    (sum, donation) => sum + donation.amount,
    0,
  );
  const activeCampaigns = students.filter(
    (student) =>
      student.visibility === "published" &&
      (student.campaignStatus === "active" ||
        student.campaignStatus === "fully-funded"),
  ).length;

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = startOfMonth(subMonths(new Date(), 5 - index));
    return {
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
    };
  });

  const trendData = months.map((month) => ({
    label: month.label,
    value: approved
      .filter(
        (donation) => format(new Date(donation.submittedAt), "yyyy-MM") === month.key,
      )
      .reduce((sum, donation) => sum + donation.amount, 0),
  }));

  const methodTotals = {
    bkash: approved
      .filter((donation) => donation.method === "bkash")
      .reduce((sum, donation) => sum + donation.amount, 0),
    "bank-transfer": approved
      .filter((donation) => donation.method === "bank-transfer")
      .reduce((sum, donation) => sum + donation.amount, 0),
    nagad: approved
      .filter((donation) => donation.method === "nagad")
      .reduce((sum, donation) => sum + donation.amount, 0),
  };

  const recent = [...donations]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )
    .slice(0, 6);

  const topCampaigns = [...students]
    .filter((student) => student.visibility === "published")
    .map((student) => ({ student, funding: fundingFor(student.id) }))
    .sort((a, b) => b.funding.percent - a.funding.percent)
    .slice(0, 4);

  const lastMessages = [...messages]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          session?.name
            ? `Welcome back, ${session.name.split(" ")[0]}`
            : "Admin overview"
        }
        description="A live view of fundraising, campaign health, and items waiting for review."
        action={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/students">
                <GraduationCap className="size-4" />
                Manage students
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/donations">
                Review donations
                {pending.length > 0 && (
                  <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                    {pending.length}
                  </span>
                )}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Verified funds raised"
          value={formatBDT(totalRaised)}
          icon={Wallet}
          hint={`${approved.length} approved donations`}
          tone="brand"
        />
        <StatCard
          label="Pending review"
          value={String(pending.length)}
          icon={Clock3}
          hint={
            pending.length > 0
              ? `${formatBDT(pending.reduce((sum, donation) => sum + donation.amount, 0))} awaiting verification`
              : "All submissions reviewed"
          }
        />
        <StatCard
          label="Active campaigns"
          value={String(activeCampaigns)}
          icon={GraduationCap}
          hint={`${students.length} students in total`}
        />
        <StatCard
          label="Registered donors"
          value={String(donors.length)}
          icon={HeartHandshake}
          hint={`${new Set(approved.map((donation) => donation.donorId)).size} have donated`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-navy">
                Verified donations
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-muted">
                Approved totals over the last six months
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-2.5 py-1 text-[10.5px] font-semibold text-brand-dark">
              <CalendarDays className="size-3" />
              May – Oct 2026
            </span>
          </div>
          <div className="mt-4">
            <DonationTrendChart data={trendData} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-[15px] font-bold text-navy">Payment methods</h2>
            <p className="mt-0.5 text-[11px] text-slate-muted">
              Share of verified donation value
            </p>
          </div>
          <div className="mt-5">
            <MethodDonut
              centerLabel="Verified"
              centerValue={formatBDT(totalRaised)}
              slices={[
                {
                  label: "bKash",
                  value: methodTotals.bkash,
                  color: "#138B60",
                },
                {
                  label: "Bank transfer",
                  value: methodTotals["bank-transfer"],
                  color: "#102A43",
                },
                {
                  label: "Nagad",
                  value: methodTotals.nagad,
                  color: "#F59E0B",
                },
              ]}
            />
          </div>
          <div className="mt-5 rounded-xl bg-surface p-3 text-[10.5px] leading-relaxed text-slate-muted">
            <CheckCircle2 className="mr-1 inline size-3.5 text-emerald-600" />
            Only admin-approved donations are included in campaign totals and
            charts.
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold text-navy">Recent activity</h2>
              <p className="mt-0.5 text-[11px] text-slate-muted">
                Latest donation submissions across all statuses
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/donations">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {recent.map((donation) => {
              const student = students.find(
                (item) => item.id === donation.studentId,
              );
              const donor = donors.find(
                (item) => item.id === donation.donorId,
              );
              return (
                <li
                  key={donation.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <StudentAvatar
                    name={student?.fullName ?? "Student"}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-ink">
                      {donor?.fullName ?? "Donor"} → {student?.fullName ?? "Student"}
                    </p>
                    <p className="text-[10.5px] text-slate-muted">
                      {donationTypeLabels[donation.type]} ·{" "}
                      {timeAgo(donation.submittedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12.5px] font-bold text-ink">
                      {formatBDT(donation.amount)}
                    </p>
                    <StatusPill
                      tone={donationStatusTone(donation.status)}
                      className="mt-0.5 py-0.5 text-[9.5px]"
                    >
                      {donationStatusLabels[donation.status]}
                    </StatusPill>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy">
                  Needs attention
                  {pending.length > 0 && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      {pending.length}
                    </span>
                  )}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-muted">
                  Donations awaiting manual verification
                </p>
              </div>
            </div>
            {pending.length === 0 ? (
              <p className="px-5 py-6 text-center text-[12px] text-slate-muted">
                Everything is reviewed. Nice work.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {pending.slice(0, 4).map((donation) => {
                  const student = students.find(
                    (item) => item.id === donation.studentId,
                  );
                  return (
                    <li
                      key={donation.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <HandCoins className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-ink">
                          {student?.fullName ?? "Student"}
                        </p>
                        <p className="text-[10px] text-slate-muted">
                          {donation.receiptNumber} · {formatBDT(donation.amount)}
                        </p>
                      </div>
                      <Button asChild size="xs" variant="outline">
                        <Link href="/admin/donations">Review</Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="border-t border-border p-3">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/admin/donations">
                  Open donation queue
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy">
                Messages
                {unreadAdminCount > 0 && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadAdminCount}
                  </span>
                )}
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/messages">
                  Open
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {lastMessages.map((message) => {
                const conversation = conversations.find(
                  (item) => item.id === message.conversationId,
                );
                const donor = donors.find(
                  (item) => item.id === conversation?.donorId,
                );
                return (
                  <li key={message.id} className="px-5 py-3">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink">
                      <MessageSquare className="size-3.5 text-brand" />
                      {donor?.fullName ?? "Donor"}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[10.5px] text-slate-muted">
                      {message.body}
                    </p>
                  </li>
                );
              })}
            </ul>
            {lastMessages.length === 0 && (
              <p className="px-5 py-6 text-center text-[12px] text-slate-muted">
                No messages yet.
              </p>
            )}
          </section>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-navy">Campaign health</h2>
            <p className="mt-0.5 text-[11px] text-slate-muted">
              Published campaigns closest to their funding target
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/students">
              All students
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {topCampaigns.map(({ student, funding }) => (
            <div key={student.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2.5">
                <StudentAvatar name={student.fullName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-ink">
                    {student.fullName}
                  </p>
                  <p className="truncate text-[10px] text-slate-muted">
                    {student.district}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10.5px]">
                <span className="text-slate-muted">
                  {formatBDT(funding.raised)}
                </span>
                <span className="font-bold text-brand-dark">
                  {funding.percent}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${funding.percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[9.5px] text-slate-muted">
                of {formatBDT(funding.required)} · {funding.supporterCount}{" "}
                supporters
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-white px-4 py-3 text-[11px] text-slate-muted">
        <Users className="size-4 shrink-0" />
        Donor accounts, donations and campaign totals are stored in Supabase and
        shared across every device.
        <Inbox className="ml-auto hidden size-4 sm:block" aria-hidden="true" />
      </div>
    </div>
  );
}
