"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HandCoins,
  Heart,
  MessageSquare,
  Search,
  Wallet,
} from "lucide-react";
import { StudentAvatar } from "@/components/students/student-avatar";
import { FundingProgress } from "@/components/students/funding-progress";
import { StatusPill, donationStatusTone } from "@/components/shared/status-pill";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/lib/store/demo-store";
import {
  donationTypeLabels,
  formatMoney,
  formatDate,
  timeAgo,
} from "@/lib/utils";

export function DashboardOverview() {
  const {
    session,
    hydrated,
    donations,
    students,
    conversations,
    messages,
    fundingFor,
    unreadDonorCount,
  } = useDemoData();

  if (!hydrated || !session) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const myDonations = donations
    .filter((donation) => donation.donorId === session.donorId)
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  const approved = myDonations.filter(
    (donation) => donation.status === "approved",
  );
  const pending = myDonations.filter(
    (donation) => donation.status === "pending",
  );
  const monthly = approved.filter((donation) => donation.type === "monthly");
  const totalDonated = approved.reduce(
    (total, donation) => total + donation.amount,
    0,
  );

  const supportedStudentIds = [...new Set(approved.map((d) => d.studentId))];
  const supportedStudents = supportedStudentIds
    .map((id) => students.find((student) => student.id === id))
    .filter((student): student is NonNullable<typeof student> => Boolean(student));

  const myConversations = conversations
    .filter((conversation) => conversation.donorId === session.donorId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  const recent = myDonations.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy-light to-brand-deep p-6 text-white sm:p-7">
        <div className="pattern-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="absolute -top-16 -right-10 size-56 rounded-full bg-brand/25 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/70">
              Donor dashboard
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Welcome back, {session.name.split(" ")[0]}
            </h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/60">
              {approved.length > 0
                ? `You have supported ${supportedStudents.length} ${supportedStudents.length === 1 ? "student" : "students"} with ${formatMoney(totalDonated)} in verified donations.`
                : "Your support can help a student stay in class. Browse verified profiles to get started."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="white">
              <Link href="/students">
                <Heart className="size-4" />
                Support a student
              </Link>
            </Button>
            <Button
              asChild
              className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/dashboard/donations">
                My donations
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total donated"
          value={formatMoney(totalDonated)}
          icon={Wallet}
          hint="Verified donations only"
          tone="brand"
        />
        <StatCard
          label="Students supported"
          value={String(supportedStudents.length)}
          icon={GraduationCap}
          hint="Across all campaigns"
        />
        <StatCard
          label="Monthly sponsorships"
          value={String(monthly.length)}
          icon={CalendarClock}
          hint="Approved monthly donations"
        />
        <StatCard
          label="Pending verification"
          value={String(pending.length)}
          icon={Clock3}
          hint={
            pending.length > 0
              ? "Our team is reviewing your submissions"
              : "Nothing waiting for review"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[15px] font-bold text-navy">Recent donations</h2>
              <p className="mt-0.5 text-[11px] text-slate-muted">
                Latest submissions and their verification status
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/donations">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          {recent.length > 0 ? (
            <ul className="divide-y divide-border">
              {recent.map((donation) => {
                const student = students.find(
                  (item) => item.id === donation.studentId,
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
                      <p className="truncate text-[13px] font-semibold text-ink">
                        {student?.fullName ?? "Student"}
                      </p>
                      <p className="text-[11px] text-slate-muted">
                        {donationTypeLabels[donation.type]} ·{" "}
                        {formatDate(donation.submittedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-ink">
                        {formatMoney(donation.amount)}
                      </p>
                      <StatusPill
                        tone={donationStatusTone(donation.status)}
                        className="mt-0.5"
                      >
                        {donation.status === "pending"
                          ? "Pending"
                          : donation.status === "approved"
                            ? "Approved"
                            : "Rejected"}
                      </StatusPill>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={HandCoins}
                title="No donations yet"
                description="When you submit a donation, it will appear here with its verification status."
                action={
                  <Button asChild size="sm">
                    <Link href="/students">Find a student</Link>
                  </Button>
                }
                className="border-0 bg-surface py-10"
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy">
                Messages
                {unreadDonorCount > 0 && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadDonorCount}
                  </span>
                )}
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-muted">
                Conversations with the CEBBD team
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/messages">
                Open
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          {myConversations.length > 0 ? (
            <ul className="divide-y divide-border">
              {myConversations.slice(0, 3).map((conversation) => {
                const student = students.find(
                  (item) => item.id === conversation.studentId,
                );
                const lastMessage = [...messages]
                  .filter((message) => message.conversationId === conversation.id)
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )[0];
                return (
                  <li key={conversation.id}>
                    <Link
                      href="/dashboard/messages"
                      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface"
                    >
                      <StudentAvatar
                        name={student?.fullName ?? "Student"}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12.5px] font-semibold text-ink">
                            {student?.fullName ?? "Student"}
                          </p>
                          <span className="shrink-0 text-[10px] text-slate-muted">
                            {timeAgo(conversation.updatedAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-muted">
                          {lastMessage?.body ?? conversation.subject}
                        </p>
                      </div>
                      {conversation.unreadForDonor > 0 && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={MessageSquare}
                title="No messages yet"
                description="Open a student profile and send a message to start a conversation with our team."
                className="border-0 bg-surface py-10"
              />
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-navy">Students you support</h2>
            <p className="mt-0.5 text-[11px] text-slate-muted">
              Campaign progress is based on approved donations only
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/students">
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {supportedStudents.length > 0 ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {supportedStudents.slice(0, 3).map((student) => {
              const funding = fundingFor(student.id);
              const given = approved
                .filter((donation) => donation.studentId === student.id)
                .reduce((total, donation) => total + donation.amount, 0);
              return (
                <div
                  key={student.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={student.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-ink">
                        {student.fullName}
                      </p>
                      <p className="truncate text-[10.5px] text-slate-muted">
                        {student.institution}
                      </p>
                    </div>
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-muted">Your support</span>
                    <span className="font-bold text-brand-dark">
                      {formatMoney(given)}
                    </span>
                  </div>
                  <FundingProgress percent={funding.percent} className="mt-2" />
                  <div className="mt-3 flex gap-2">
                    <Button asChild variant="outline" size="xs" className="flex-1">
                      <Link href={`/students/${student.slug}`}>View profile</Link>
                    </Button>
                    <Button asChild size="xs" className="flex-1">
                      <Link href={`/students/${student.slug}/donate`}>
                        Support again
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Search}
              title="You have not supported a student yet"
              description="Browse verified student profiles and choose the story that speaks to you."
              action={
                <Button asChild size="sm">
                  <Link href="/students">Browse students</Link>
                </Button>
              }
              className="border-0 bg-surface py-10"
            />
          </div>
        )}
      </section>
    </div>
  );
}
