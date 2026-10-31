import Link from "next/link";
import { ArrowRight, Compass, GraduationCap, Home } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 py-16"
    >
      <div className="pattern-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -top-32 -right-20 size-96 rounded-full bg-brand-light blur-3xl"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.22em] text-brand">
          404 · Page not found
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
          This page has moved on.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-slate-muted">
          The page you are looking for may have been renamed, unpublished, or never
          existed. The students are still here, though.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/students">
              <GraduationCap className="size-4" />
              Browse students
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">
              <Home className="size-4" />
              Back to homepage
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-2 rounded-2xl border border-border bg-white p-4 text-left shadow-sm sm:grid-cols-3">
          {[
            { href: "/about", label: "About CEBBD" },
            { href: "/achievements", label: "Achievements" },
            { href: "/contact", label: "Contact us" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:bg-brand-soft hover:text-brand-dark"
            >
              {link.label}
              <ArrowRight className="size-3.5 opacity-40" />
            </Link>
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-muted">
          <Compass className="size-3.5" />
          If you followed a link from an email, it may have expired.
        </p>
      </div>
    </main>
  );
}
