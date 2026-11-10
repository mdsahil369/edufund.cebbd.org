import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { siteSettings } from "@/lib/mock-data/settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the EduFund CEBBD team about donations, student support, verification, or partnerships.",
  alternates: { canonical: "/contact" },
};

const faqs = [
  {
    id: "faq-1",
    question: "How do I know my donation was received?",
    answer:
      "After you submit the donation form, the donation appears in your dashboard as “Pending”. The CEBBD finance team verifies the transaction ID and payment details, usually within one to two business days. Once approved, the status changes to “Approved” and the amount is added to the student's campaign total.",
  },
  {
    id: "faq-2",
    question: "Can I donate anonymously?",
    answer:
      "Yes. Donor names are hidden by default and appear as “Anonymous Supporter” on public pages. You can choose to show your name at any time from Privacy Settings in your donor dashboard. Your email, phone number, and address are never shown publicly.",
  },
  {
    id: "faq-3",
    question: "Why is my donation not counted immediately?",
    answer:
      "All payments are processed manually. A donation only counts toward a student's campaign after a member of the finance team has matched the transaction ID and approved it. This protects students and donors from fraudulent or duplicate submissions.",
  },
  {
    id: "faq-4",
    question: "Can I sponsor a student monthly or yearly?",
    answer:
      "Yes. Each student profile offers one-time, monthly, yearly, and full scholarship options. The amounts are set by the CEBBD team for that student. For recurring support, you submit a transfer each period and the team records it against the same campaign.",
  },
  {
    id: "faq-5",
    question: "How can my organisation partner with CEBBD?",
    answer:
      "We work with polytechnic and nursing institutes, local NGOs, and mission-aligned companies. Send us a message with the subject “Partnership” and a short description of your organisation. Our team will follow up to discuss scope and verification.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="pattern-dots absolute inset-y-0 right-0 w-1/3 opacity-40" aria-hidden="true" />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Contact</p>
            <h1 className="mt-3 text-[2.3rem] leading-[1.08] font-extrabold tracking-[-0.03em] text-navy sm:text-5xl">
              Talk to a human at CEBBD.
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-slate-muted sm:text-base">
              Questions about a donation, a student, or a partnership? Send us a
              message or reach the team directly. We do not use chatbots for donor
              support.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-ink transition-colors hover:border-brand/30 hover:text-brand-dark"
              >
                <Mail className="size-3.5" />
                {siteSettings.contactEmail}
              </a>
              <a
                href={`tel:${siteSettings.contactPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-ink transition-colors hover:border-brand/30 hover:text-brand-dark"
              >
                <Phone className="size-3.5" />
                {siteSettings.contactPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface">
        <div className="container-page grid items-start gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <ContactForm />

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="text-[14px] font-bold text-navy">CEBBD office</h2>
              <ul className="mt-3 space-y-3 text-[11.5px] text-slate-muted">
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>{siteSettings.address}</span>
                </li>
                <li>
                  <a
                    href={`mailto:${siteSettings.contactEmail}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-brand-dark"
                  >
                    <Mail className="size-4 shrink-0 text-brand" />
                    {siteSettings.contactEmail}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${siteSettings.contactPhone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-brand-dark"
                  >
                    <Phone className="size-4 shrink-0 text-brand" />
                    {siteSettings.contactPhone}
                  </a>
                </li>
                <li className="flex gap-2.5">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>
                    Sunday – Thursday, 9:00 am – 5:00 pm
                    <br />
                    <span className="text-[10px]">Bangladesh Standard Time</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-brand/15 bg-brand-soft p-5">
              <p className="flex items-center gap-2 text-[12px] font-bold text-brand-dark">
                <ShieldCheck className="size-4" />
                For donors
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-muted">
                Include your receipt number or transaction ID when asking about a
                payment. This helps the finance team find your submission quickly.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3 bg-white">
                <Link href="/dashboard/donations">View my donations</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-[12px] font-bold text-navy">
                <HeartHandshake className="size-4 text-brand" />
                For students & families
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-slate-muted">
                Please do not send student phone numbers, father&apos;s names, or
                private addresses through this form. If you are a student seeking
                support, ask about the next application window and eligibility.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-white p-4 text-[10.5px] leading-relaxed text-slate-muted">
              <MessageSquare className="mb-1 size-3.5 text-brand" />
              Every message is stored securely and reviewed by the CEBBD team. We
              reply by email, usually within one business day.
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="eyebrow">Common questions</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
              Answers before you write
            </h2>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-slate-muted">
              The quickest answers to the questions our team receives most often.
              If your question is not here, send us a message.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/about#transparency">
                How verification works
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="faq-1"
            className="rounded-2xl border border-border bg-white px-5 shadow-sm"
          >
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="py-4 text-[13px] font-semibold text-navy hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[12px] leading-relaxed text-slate-muted">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-brand-soft">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-navy">
              Ready to support a student?
            </h2>
            <p className="mt-1 text-[12.5px] text-slate-muted">
              Browse verified profiles and choose the support that fits you.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/students">
              Browse students
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
