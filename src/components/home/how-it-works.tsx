import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  MailCheck,
  UserPlus,
} from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    title: "Register your account",
    description:
      "Create a free donor account with your name, email, and mobile number. It takes less than a minute.",
  },
  {
    icon: MailCheck,
    title: "Verify your email",
    description:
      "Open the confirmation email from CEBBD and click the link. This keeps your donation history tied to the right account.",
  },
  {
    icon: BadgeCheck,
    title: "Choose a student",
    description:
      "Browse verified profiles and pick the student you want to support. Each profile shows the exact support options.",
  },
  {
    icon: CreditCard,
    title: "Pay manually",
    description:
      "Send your donation by bKash, bank transfer, or international card/remittance, then submit the transaction or bank reference.",
  },
  {
    icon: CalendarClock,
    title: "Track everything",
    description:
      "Sign in to your donor dashboard to follow every donation from pending to approved. Monthly and yearly sponsors repeat the same simple step.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin verifies",
    description:
      "Our finance team matches the payment and approves it. Only then is the amount added to the student's public campaign total.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-pad bg-surface">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="Six simple steps from generosity to real impact"
          description="No automatic card charge and no hidden fees. You pay directly, we verify the payment by hand, and the student's institution receives the support."
          align="center"
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.05}>
              <article className="relative h-full rounded-2xl border border-border bg-white p-6 shadow-[0_1px_2px_rgba(16,42,67,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_6px_16px_-6px_rgba(19,139,96,0.6)]">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-extrabold tracking-tight text-brand/10">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-[15.5px] font-bold text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-muted">
                  {step.description}
                </p>
                {index === 4 && (
                  <Link
                    href="/dashboard"
                    className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand hover:text-brand-dark"
                  >
                    Go to your dashboard
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/register">
              Create a donor account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/students">Browse student profiles</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
