import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Check,
  GraduationCap,
} from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

const ways = [
  {
    icon: GraduationCap,
    title: "Sponsor a Student",
    description:
      "Choose a verified student and support their education directly. Follow their progress from application to graduation.",
    points: [
      "One-time or recurring support",
      "Direct fee payments to institutions",
      "Personal updates through our team",
    ],
    href: "/students",
    cta: "Find a student",
    accent: "bg-brand text-white",
  },
  {
    icon: BookOpenCheck,
    title: "Support Education",
    description:
      "Contribute to the general education fund that covers urgent needs, learning materials, and emergency support.",
    points: [
      "Flexible contribution amount",
      "Allocated by the CEBBD team",
      "Reported transparently each quarter",
    ],
    href: "/contact",
    cta: "Talk to our team",
    accent: "bg-navy text-white",
  },
  {
    icon: Building2,
    title: "Become a Partner",
    description:
      "Institutions, companies, and community groups can partner with CEBBD to fund scholarships and learning infrastructure.",
    points: [
      "Named scholarship programmes",
      "Employee giving partnerships",
      "Joint reporting and recognition",
    ],
    href: "/contact",
    cta: "Start a partnership",
    accent: "bg-[#b47a1e] text-white",
  },
];

export function WaysToSupportSection() {
  return (
    <section className="section-pad bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Ways to support"
          title="There is more than one way to change a life"
          description="Whether you want to fund one student or build a long-term partnership, every contribution is handled with care and verified before it reaches a classroom."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {ways.map((way, index) => (
            <Reveal key={way.title} delay={index * 0.07}>
              <div className="group flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_20px_45px_-30px_rgba(16,42,67,0.35)]">
                <span
                  className={`inline-flex size-11 items-center justify-center rounded-xl ${way.accent}`}
                >
                  <way.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-navy">{way.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-muted">
                  {way.description}
                </p>
                <ul className="mt-5 space-y-2.5 border-t border-dashed border-border pt-5">
                  {way.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-[12.5px] text-ink/80"
                    >
                      <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={way.href}>
                      {way.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
