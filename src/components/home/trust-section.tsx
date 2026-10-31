import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Eye,
  Landmark,
  LockKeyhole,
  MousePointerClick,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: BadgeCheck,
    title: "Verified applications",
    description:
      "Every student profile is reviewed by our team before publication. Academic documents and institutional details are checked.",
  },
  {
    icon: Landmark,
    title: "Direct fee payments",
    description:
      "Approved funds are paid to the student's institution against their account — not handed over as untracked cash.",
  },
  {
    icon: Eye,
    title: "Public progress",
    description:
      "Campaign totals only move when a donation is approved. Pending submissions are clearly marked and never counted.",
  },
  {
    icon: LockKeyhole,
    title: "Private information stays private",
    description:
      "Phone numbers, family details, and private addresses are never shown on public profiles or donation pages.",
  },
];

const flow = [
  {
    icon: MousePointerClick,
    title: "You choose a student",
    detail: "Pick a support type and see the exact remaining need.",
  },
  {
    icon: Send,
    title: "You transfer manually",
    detail: "Use bank transfer, bKash, or Nagad and submit the transaction details.",
  },
  {
    icon: ShieldCheck,
    title: "CEBBD verifies",
    detail: "Our finance team matches the transaction and approves or rejects it.",
  },
  {
    icon: Building2,
    title: "The institution is paid",
    detail: "Approved support is paid to the student's institution against their account.",
  },
];

export function TrustSection() {
  return (
    <section id="transparency" className="section-pad bg-surface">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Trust & transparency"
              title="Generosity deserves a process you can see"
              description="EduFund CEBBD is built around one promise: every taka is handled carefully, verified independently, and reported back to the community."
            />
            <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.title} delay={index * 0.05}>
                  <div className="flex gap-3.5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand/10 bg-white text-brand-dark shadow-sm">
                      <pillar.icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-[14.5px] font-bold text-navy">
                        {pillar.title}
                      </h3>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-muted">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-9">
              <Link href="/about#transparency">
                Learn how donations work
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_20px_50px_-35px_rgba(16,42,67,0.35)] sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">The journey</p>
                  <h3 className="mt-1.5 text-lg font-bold text-navy">
                    What happens to your donation
                  </h3>
                </div>
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                  <ShieldCheck className="size-5" />
                </span>
              </div>

              <ol className="mt-6 space-y-0">
                {flow.map((step, index) => (
                  <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < flow.length - 1 && (
                      <span
                        className="absolute top-10 left-[19px] h-[calc(100%-2.5rem)] w-px border-l border-dashed border-brand/25"
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-brand/15 bg-brand-soft text-brand-dark">
                      <step.icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[13.5px] font-semibold text-navy">
                        {step.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-muted">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[11.5px] leading-relaxed text-amber-800">
                <strong className="font-semibold">Important:</strong> pending
                donations never increase a campaign total. Only admin-approved
                payments count toward a student&apos;s progress.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
