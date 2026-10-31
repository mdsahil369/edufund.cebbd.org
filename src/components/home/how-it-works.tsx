import Link from "next/link";
import { ArrowRight, HeartHandshake, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Discover a Student",
    description:
      "Browse verified student profiles by education category, location, and campaign status. Every application is reviewed by the CEBBD team before it is published.",
  },
  {
    icon: HeartHandshake,
    title: "Choose Your Support",
    description:
      "Give once, sponsor monthly or yearly, or fund a full scholarship. Support amounts are set per student by CEBBD and shown clearly on each profile.",
  },
  {
    icon: Sparkles,
    title: "Make a Difference",
    description:
      "Submit your manual payment, and our finance team verifies it. Once approved, your contribution is added to the student's campaign and paid to their institution.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-pad bg-surface">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="Three simple steps from generosity to real impact"
          description="We keep the process transparent and human. No automated payments, no hidden fees — just verified support delivered to students who need it."
          align="center"
        />

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div
            className="absolute top-12 right-[16%] left-[16%] hidden border-t border-dashed border-brand/25 md:block"
            aria-hidden="true"
          />
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <div className="relative h-full rounded-2xl border border-border bg-white p-6 shadow-[0_1px_2px_rgba(16,42,67,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_6px_16px_-6px_rgba(19,139,96,0.6)]">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-4xl font-extrabold tracking-tight text-brand/10">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-navy">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/students">
              Browse student profiles
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
