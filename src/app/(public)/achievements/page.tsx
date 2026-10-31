import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { AchievementsGallery } from "@/components/home/achievements-gallery";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { achievements } from "@/lib/mock-data/achievements";
import { impactStats } from "@/lib/mock-data/stats";
import { formatCompactBDT, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Milestones from the CEBBD education programme — scholarships, learning infrastructure, partnerships, and student graduations across Bangladesh.",
  alternates: { canonical: "/achievements" },
};

export default function AchievementsPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="pattern-dots absolute inset-y-0 right-0 w-1/3 opacity-40" aria-hidden="true" />
        <div className="container-page relative py-14 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow">CEBBD achievements</p>
            <h1 className="mt-3 text-[2.4rem] leading-[1.07] font-extrabold tracking-[-0.03em] text-navy sm:text-5xl">
              Progress measured in students, not press releases.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-muted sm:text-base">
              Scholarships awarded, classrooms equipped, partnerships formed, and
              students who crossed the finish line. These are the milestones that
              matter to our community.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/students">
                  <HeartHandshake className="size-4" />
                  Support the next milestone
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">
                  How we work
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: GraduationCap,
                value: `${formatNumber(impactStats.studentsSupported)}+`,
                label: "Students supported",
              },
              {
                icon: Wallet,
                value: formatCompactBDT(impactStats.fundsRaised),
                label: "Verified funds raised",
              },
              {
                icon: Landmark,
                value: "64",
                label: "Districts reached",
              },
              {
                icon: Sparkles,
                value: String(achievements.length),
                label: "Milestones recorded",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-dark shadow-sm">
                  <stat.icon className="size-4" />
                </span>
                <div>
                  <p className="text-lg font-extrabold tracking-tight text-navy">
                    {stat.value}
                  </p>
                  <p className="text-[10.5px] text-slate-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our journey"
            title="Milestones from the education programme"
            description="New stories are added by the CEBBD team as the programme grows. Read three at a time, or explore the full timeline below."
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-slate-muted">
                <CalendarDays className="size-3.5" />
                Updated September 2026
              </span>
            }
          />
          <AchievementsGallery achievements={achievements} className="mt-10" />
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow">Behind the numbers</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
              Every milestone is a student who stayed.
            </h2>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-slate-muted">
              A scholarship does more than pay a fee. It buys time to study,
              reduces the pressure to leave school for work, and tells a student
              that their community believes in them. We record milestones because
              they help us learn — not because they make good headlines.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-muted">
              <span className="rounded-full border border-border bg-surface px-3 py-1">
                Verified student stories
              </span>
              <span className="rounded-full border border-border bg-surface px-3 py-1">
                Institutional payments
              </span>
              <span className="rounded-full border border-border bg-surface px-3 py-1">
                Community partnerships
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-brand/15 bg-brand-soft p-6">
            <Users className="size-6 text-brand" />
            <p className="mt-3 text-[15px] leading-snug font-semibold text-navy">
              “The most important metric is not how much we raised. It is how many
              students felt safe enough to keep going.”
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-brand-dark">
              CEBBD Education Team
            </p>
            <Button asChild variant="outline" className="mt-5 bg-white">
              <Link href="/contact">
                Work with us
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
