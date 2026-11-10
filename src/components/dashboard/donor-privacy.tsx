"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Heart,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/student-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDemoData } from "@/lib/store/demo-store";
import { formatMoney } from "@/lib/utils";

export function DonorPrivacy() {
  const {
    session,
    hydrated,
    accountReady,
    donors,
    donations,
    students,
    setShowNamePublicly,
  } = useDemoData();
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  if (!hydrated || !accountReady || !session) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const donor = donors.find((item) => item.id === session.donorId);
  if (!donor) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center text-[13px] text-slate-muted">
        Donor profile not found.
      </div>
    );
  }

  const latestApproved = donations
    .filter(
      (donation) =>
        donation.donorId === donor.id && donation.status === "approved",
    )
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )[0];
  const previewStudent =
    students.find((student) => student.id === latestApproved?.studentId) ??
    students[0];
  const previewAmount = latestApproved?.amount ?? 2500;
  const publicName = donor.showNamePublicly
    ? donor.fullName
    : "Anonymous Supporter";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Privacy Settings"
        description="You control how your identity appears when you support a student. These settings apply to every public page immediately."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                  {donor.showNamePublicly ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </span>
                <div>
                  <h2 className="text-[14px] font-bold text-navy">
                    Show my name publicly
                  </h2>
                  <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-slate-muted">
                    When this is on, your name appears next to your donations on
                    student profiles. When it is off, you appear as “Anonymous
                    Supporter”.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:pt-1">
                <span className="text-[11px] font-semibold text-slate-muted">
                  {donor.showNamePublicly ? "On" : "Off"}
                </span>
                <Switch
                  checked={donor.showNamePublicly}
                  disabled={savingPrivacy}
                  onCheckedChange={async (checked) => {
                    setSavingPrivacy(true);
                    const result = await setShowNamePublicly(checked);
                    setSavingPrivacy(false);

                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }

                    toast.success(
                      checked
                        ? "Your name will be shown publicly."
                        : "Your donations will appear as Anonymous Supporter.",
                    );
                  }}
                  aria-label="Show my name publicly"
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-muted">
                Public preview
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                <StudentAvatar name={publicName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-ink">
                    {publicName}
                  </p>
                  <p className="text-[10.5px] text-slate-muted">
                    donated {formatMoney(previewAmount)} to{" "}
                    {previewStudent?.fullName ?? "a student"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-1 text-[9.5px] font-semibold text-brand-dark">
                  <Heart className="size-2.5 fill-current" />
                  Verified
                </span>
              </div>
              <p className="mt-2.5 text-[10px] leading-relaxed text-slate-muted">
                Only your display name and donation amount are shown. Your email,
                phone number, address, and donor ID are never public.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-navy">
              <ShieldCheck className="size-4 text-brand" />
              What CEBBD keeps private
            </h2>
            <ul className="mt-3 space-y-2.5">
              {[
                {
                  icon: Lock,
                  title: "Contact details",
                  description:
                    "Your email, phone number, and address are only visible to authorised CEBBD staff for donation verification.",
                },
                {
                  icon: UserRound,
                  title: "Donor identity by default",
                  description:
                    "New accounts are anonymous by default. You can opt in to showing your name at any time.",
                },
                {
                  icon: Eye,
                  title: "Your full donation history",
                  description:
                    "Public pages only show individual verified donations. Your complete history is private to you and CEBBD.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-slate-muted" />
                  <div>
                    <p className="text-[12px] font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-muted">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">Edit profile details</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/privacy-policy">Read the privacy policy</Link>
            </Button>
          </div>
        </div>

        <aside className="rounded-2xl border border-brand/15 bg-brand-soft p-5">
          <h2 className="text-[13px] font-bold text-brand-dark">
            How anonymity works
          </h2>
          <p className="mt-2 text-[11.5px] leading-relaxed text-slate-muted">
            Students and visitors cannot see who you are unless you choose to
            share your name. The CEBBD team can still contact you about your
            donations and verification, and your messages remain private to your
            account.
          </p>
          <div className="mt-4 space-y-2 border-t border-brand/10 pt-4 text-[11px] text-slate-muted">
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-brand" />
              You can change this setting anytime.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-brand" />
              Changes apply to past and future donations.
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-brand" />
              Admin access is limited to authorised staff.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
