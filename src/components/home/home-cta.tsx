import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeCtaSection() {
  return (
    <section className="bg-surface pb-16 sm:pb-20 lg:pb-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep via-brand-dark to-brand px-6 py-12 shadow-[0_30px_70px_-40px_rgba(5,77,54,0.8)] sm:px-10 sm:py-14 lg:px-14">
          <div className="pattern-grid absolute inset-0 opacity-70" aria-hidden="true" />
          <div
            className="absolute -top-24 -right-20 size-80 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-emerald-300/10 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-100">
                <ShieldCheck className="size-3.5" />
                Verified students. Transparent support.
              </p>
              <h2 className="mt-4 text-3xl leading-[1.12] font-bold text-white sm:text-4xl">
                Your kindness can keep a student in class this year.
              </h2>
              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/70">
                Choose a student, make a manual contribution, and let our team
                handle verification and payment. Every step is visible in your
                dashboard.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild variant="white" size="lg">
                <Link href="/students">
                  <Heart className="size-4" />
                  Support a Student
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/contact">
                  Become a Partner
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
