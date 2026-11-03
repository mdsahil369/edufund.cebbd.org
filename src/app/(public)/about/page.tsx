import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Landmark,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { impactStats } from "@/lib/mock-data/stats";
import { formatCompactBDT, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About CEBBD",
  description:
    "Learn how Community Empowerment Bangladesh (CEBBD) verifies students, manages donations, and helps students across Bangladesh continue their education with dignity.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: GraduationCap,
    title: "Access before ambition",
    description:
      "Talent is everywhere, but opportunity is not. We remove the financial barriers that force capable students to leave school.",
  },
  {
    icon: HandHeart,
    title: "Dignity in every detail",
    description:
      "Students are never reduced to a case file. Their stories are shared with consent, and their private information stays private.",
  },
  {
    icon: ShieldCheck,
    title: "Transparency by design",
    description:
      "Every payment is verified manually before it counts. Donors can see the status of each submission and how funds are applied.",
  },
];

const verificationSteps = [
  {
    title: "Application & documents",
    description:
      "Students apply through a local partner or directly with CEBBD. We collect academic records, income information, and a personal statement.",
  },
  {
    title: "Home & institute visit",
    description:
      "A field officer visits the family and the institute to confirm the student's circumstances, outstanding fees, and enrolment status.",
  },
  {
    title: "Campaign review",
    description:
      "Our education team checks the story, funding requirement, and support plan. Only verified students are published.",
  },
  {
    title: "Payment to institution",
    description:
      "Approved donations are paid directly to the institute against the student's account. Receipts are recorded and shared.",
  },
];

const partners = [
  {
    icon: Landmark,
    title: "Polytechnic & nursing institutes",
    description:
      "Formal partnerships let us verify enrolment and pay fees directly to institutional accounts.",
  },
  {
    icon: Building2,
    title: "Local NGOs & community groups",
    description:
      "Grassroots partners help us reach students in remote districts and follow up after enrolment.",
  },
  {
    icon: HeartHandshake,
    title: "Corporate & institutional supporters",
    description:
      "CSR partnerships and employee giving programmes fund cohorts of scholars and learning infrastructure.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pattern-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="absolute -top-40 -right-24 size-[460px] rounded-full bg-brand/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-48 -left-24 size-[420px] rounded-full bg-emerald-300/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="container-page relative grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="eyebrow text-emerald-200/80">About Community Empowerment Bangladesh</p>
            <h1 className="mt-4 max-w-2xl text-[2.5rem] leading-[1.06] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">
              Education should never end because money runs out.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base">
              CEBBD connects generous supporters with students who have the ability
              and determination to continue their education — but not the means.
              We verify every story, manage every payment, and keep the process
              human.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/students">
                  <HeartHandshake className="size-4" />
                  Support a student
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/contact">
                  Talk to our team
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/55">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-3.5 text-emerald-300" />
                Founded in 2016
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-emerald-300" />
                Community-led, Bangladesh-focused
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-300" />
                100% manual payment verification
              </span>
            </div>
          </div>

          <Reveal className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src="/images/achievements/achievement-2.svg"
                alt="Students learning in a CEBBD-supported digital learning lab"
                width={900}
                height={700}
                unoptimized
                className="h-[320px] w-full object-cover sm:h-[380px]"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/70 to-transparent p-5 pt-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                  Our belief
                </p>
                <p className="mt-1.5 max-w-sm text-[14px] leading-snug font-medium text-white">
                  “A scholarship is not charity. It is a community choosing to
                  invest in its own future.”
                </p>
              </div>
            </div>
            <div className="absolute -top-4 -right-3 rounded-2xl border border-white/15 bg-white p-3 text-navy shadow-xl">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-muted">
                Students supported
              </p>
              <p className="text-xl font-extrabold">{formatNumber(impactStats.studentsSupported)}+</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page grid items-start gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="A bridge between generosity and potential"
              description="Community Empowerment Bangladesh is a community-led organisation working across all 64 districts. Our education programme supports students at the point where financial pressure most often forces them to stop studying."
            />
            <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-slate-muted">
              <p>
                We started with a simple observation: many students drop out not
                because they lack ability, but because a single semester fee, exam
                registration, or transport cost becomes impossible to meet.
              </p>
              <p>
                EduFund CEBBD was built to make that moment less lonely. Donors can
                see verified student profiles, choose how they want to help, and
                follow the verification of every payment. Students receive support
                without their private details being exposed.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Education access",
                "Financial assistance",
                "Mentoring",
                "Community partnerships",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-slate-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: GraduationCap,
                value: `${formatNumber(impactStats.studentsSupported)}+`,
                label: "Students supported",
                hint: "Across diploma, admission, and higher education",
              },
              {
                icon: Wallet,
                value: formatCompactBDT(impactStats.fundsRaised),
                label: "Verified funds raised",
                hint: "Illustrative programme total",
              },
              {
                icon: Users,
                value: String(impactStats.communitySupporters),
                label: "Community supporters",
                hint: "Donors and volunteers",
              },
              {
                icon: Landmark,
                value: "64",
                label: "Districts reached",
                hint: "Every district in Bangladesh",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                  <stat.icon className="size-5" />
                </span>
                <p className="mt-3 text-2xl font-extrabold tracking-tight text-navy">
                  {stat.value}
                </p>
                <p className="text-[12px] font-semibold text-ink">{stat.label}</p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-muted">
                  {stat.hint}
                </p>
              </div>
            ))}
            <p className="text-[10px] text-slate-muted sm:col-span-2">
              Programme figures are illustrative and will be updated as verified
              data is added.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface">
        <div className="container-page">
          <SectionHeading
            eyebrow="What guides us"
            title="Three principles we will not compromise"
            description="These principles shape how we select students, tell their stories, and handle every taka that passes through the programme."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 0.05}>
                <article className="h-full rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand text-white">
                    <value.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-[16px] font-bold text-navy">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-muted">
                    {value.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="How verification works"
              title="Every student is checked before a profile goes live"
              description="We do not publish a campaign on the strength of a form alone. Our team visits, calls, and cross-checks before a student appears on the site."
            />
            <div className="mt-6 rounded-2xl border border-brand/15 bg-brand-soft p-5">
              <p className="flex items-center gap-2 text-[12px] font-bold text-brand-dark">
                <CheckCircle2 className="size-4" />
                What this means for donors
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-muted">
                Your donation is never auto-approved. A finance team member checks
                the transaction ID and approves the payment before it is added to
                the student&apos;s campaign total.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/about#transparency">
                Read about transparency
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <ol className="relative space-y-0">
            {verificationSteps.map((step, index) => (
              <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
                {index < verificationSteps.length - 1 && (
                  <span
                    className="absolute top-9 left-[15px] h-[calc(100%-28px)] w-px bg-border"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-brand/20 bg-brand-light text-[11px] font-bold text-brand-dark">
                  {index + 1}
                </span>
                <div className="pt-0.5">
                  <h3 className="text-[14px] font-bold text-navy">{step.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-slate-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="transparency" className="relative overflow-hidden bg-navy text-white">
        <div className="pattern-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="container-page relative py-14 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
            <SectionHeading
              eyebrow="Transparency"
              tone="light"
              title="Follow the money from donation to classroom"
              description="Manual verification is slower than an automated checkout — and that is the point. It gives our finance team a chance to confirm that every payment is real, matched to the right student, and applied correctly."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Pending until verified",
                  description:
                    "Submitted donations never count toward a campaign until an admin approves them.",
                },
                {
                  icon: Landmark,
                  title: "Paid to institutions",
                  description:
                    "Approved funds are transferred to the student's institute against their account, not handed over in cash.",
                },
                {
                  icon: BadgeCheck,
                  title: "Receipts recorded",
                  description:
                    "Each verified payment is recorded with a receipt number and transaction reference for audit.",
                },
                {
                  icon: Sparkles,
                  title: "Private by default",
                  description:
                    "Donors appear as “Anonymous Supporter” unless they choose to show their name.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm"
                >
                  <item.icon className="size-5 text-emerald-300" />
                  <h3 className="mt-3 text-[13.5px] font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/60">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-6">
            <Button asChild variant="white">
              <Link href="/students">Browse verified students</Link>
            </Button>
            <Button
              asChild
              className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/privacy-policy">Read our privacy policy</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="partnerships" className="section-pad bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Partnerships"
            title="We do this with partners, not alone"
            description="Institutes, local organisations, and mission-aligned companies help us reach students and verify need. If your organisation shares this goal, we would like to hear from you."
            action={
              <Button asChild variant="outline">
                <Link href="/contact">
                  Partner with us
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {partners.map((partner) => (
              <article
                key={partner.title}
                className="rounded-2xl border border-border bg-white p-6 shadow-sm"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
                  <partner.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-navy">
                  {partner.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-muted">
                  {partner.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-soft">
        <div className="container-page flex flex-col items-start justify-between gap-5 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Take the next step</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
              One student. One semester. One less reason to drop out.
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-muted">
              Browse verified profiles and choose the student whose story you want
              to support.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/students">
              Support a student
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
