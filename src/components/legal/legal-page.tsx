import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, Mail, ShieldCheck } from "lucide-react";
import { siteSettings } from "@/lib/mock-data/settings";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: LegalPageProps) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="pattern-dots absolute inset-y-0 right-0 w-1/3 opacity-40" aria-hidden="true" />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 text-[2.2rem] leading-[1.08] font-extrabold tracking-[-0.03em] text-navy sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-muted sm:text-[15px]">
              {description}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-slate-muted">
              <CalendarDays className="size-3.5" />
              Last updated: {updated}
            </p>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[230px_1fr] lg:gap-14 lg:py-14">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-muted">
              On this page
            </p>
            <nav aria-label="On this page" className="mt-3">
              <ul className="space-y-1.5 border-l border-border">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-[11.5px] leading-snug text-slate-muted transition-colors hover:border-brand hover:text-brand-dark"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6 rounded-xl border border-border bg-white p-3.5 shadow-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-navy">
                <Mail className="size-3.5 text-brand" />
                Questions?
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-muted">
                Email{" "}
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="font-medium text-brand-dark hover:underline"
                >
                  {siteSettings.contactEmail}
                </a>{" "}
                or use the contact form.
              </p>
              <Link
                href="/contact"
                className="mt-2 inline-block text-[10.5px] font-semibold text-brand hover:text-brand-dark"
              >
                Contact CEBBD →
              </Link>
            </div>
          </div>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <div className="rounded-xl border border-brand/15 bg-brand-soft px-4 py-3 text-[11.5px] leading-relaxed text-slate-muted">
            <ShieldCheck className="mr-1 inline size-3.5 text-brand" />
            This is a frontend prototype for EduFund CEBBD. Account data, donations,
            and messages in this demo are stored in your browser&apos;s local storage.
            A production deployment will use a secure backend with Supabase.
          </div>

          <div className="mt-8 space-y-9">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28"
              >
                <h2 className="flex items-baseline gap-2 text-[18px] font-bold text-navy">
                  <span className="text-[12px] font-bold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-2.5 space-y-3 text-[13px] leading-relaxed text-slate-muted [&_a]:font-medium [&_a]:text-brand-dark [&_a]:hover:underline [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-[14px] font-bold text-navy">Need clarification?</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-muted">
              Our team is happy to explain how a specific policy applies to your
              donation or student campaign.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Contact CEBBD
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
