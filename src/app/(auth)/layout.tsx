import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

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

          <ul className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
            {[
              "Choose a verified student and see their full support options.",
              "Pay by bKash, bank transfer, or international card/remittance.",
              "Follow every donation from pending to approved in your dashboard.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-white/80"
              >
                <BadgeCheck
                  className="mt-0.5 size-4 shrink-0 text-emerald-200/80"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11.5px] leading-relaxed text-white/50">
            No card details are collected. Support is verified manually by the
            CEBBD finance team before it counts.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {[
            { icon: HeartHandshake, label: "Sponsor a student" },
            { icon: LayoutDashboard, label: "Track every donation" },
            { icon: ShieldCheck, label: "Manual verification" },
          ].map((item) => (
            <div key={item.label}>
              <item.icon className="size-4 text-emerald-200/70" />
              <p className="mt-2 text-[11.5px] leading-snug font-semibold text-white">
                {item.label}
              </p>
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
