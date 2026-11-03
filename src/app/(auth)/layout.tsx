import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BadgeCheck, Quote, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { StudentAvatar } from "@/components/students/student-avatar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-deep via-brand-dark to-brand p-10 lg:flex">
        <div className="pattern-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div
          className="absolute -top-28 -right-20 size-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-24 size-96 rounded-full bg-emerald-300/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <Logo variant="light" />
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200/80">
            Education changes everything
          </p>
          <h2 className="mt-4 text-3xl leading-[1.18] font-bold text-white">
            A small act of generosity can keep a student in class.
          </h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/65">
            Join a community of supporters helping students across Bangladesh
            finish their education with dignity, transparency, and care.
          </p>

          <figure className="mt-8 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
            <Quote className="size-6 text-emerald-200/50" aria-hidden="true" />
            <blockquote className="mt-2 text-[13px] leading-relaxed text-white/80">
              “I can see exactly where my support goes. The CEBBD team verifies
              every payment and shares updates — it makes giving feel personal
              and safe.”
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <StudentAvatar name="Ayesha Rahman" size="sm" />
              <div>
                <p className="text-[12.5px] font-semibold text-white">
                  Ayesha Rahman
                </p>
                <p className="text-[10.5px] text-white/50">
                  Monthly supporter
                </p>
              </div>
            </figcaption>
          </figure>
        </div>

        <div className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {[
            { icon: Users, value: "1,200+", label: "Students supported" },
            { icon: BadgeCheck, value: "64", label: "Districts reached" },
            { icon: ShieldCheck, value: "100%", label: "Manual verification" },
          ].map((item) => (
            <div key={item.label}>
              <item.icon className="size-4 text-emerald-200/70" />
              <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
              <p className="text-[10.5px] text-white/50">{item.label}</p>
            </div>
          ))}
        </div>
      </aside>

      <main id="main-content" className="flex flex-col bg-surface">
        <div className="flex h-16 items-center justify-between px-5 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-slate-muted transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-3.5" />
            Back to website
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>

        <p className="px-5 pb-6 text-center text-[10.5px] text-slate-muted">
          © 2026 Community Empowerment Bangladesh
        </p>
      </main>
    </div>
  );
}
