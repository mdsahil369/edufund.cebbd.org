import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  Heart,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentAvatar } from "@/components/students/student-avatar";
import { FundingProgress } from "@/components/students/funding-progress";
import type { FundingSummary, PublicStudent } from "@/types";
import { formatMoney } from "@/lib/currency";

interface HeroProps {
  featuredStudent: PublicStudent;
  funding: FundingSummary;
}

export function HomeHero({ featuredStudent, funding }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 size-[520px] rounded-full bg-brand-light/70 blur-3xl" />
        <div className="absolute top-24 right-0 size-[420px] rounded-full bg-[#e9f1f8] blur-3xl" />
        <div className="pattern-dots absolute inset-y-0 right-0 w-1/2 opacity-40" />
      </div>

      <div className="container-page relative grid items-center gap-14 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-light px-3 py-1.5 text-[11.5px] font-semibold text-brand-dark">
            <Image
              src="/cebbd.png"
              alt=""
              width={18}
              height={18}
              className="size-[18px] rounded object-contain"
            />
            Community Empowerment Bangladesh
          </div>

          <h1 className="mt-6 max-w-2xl text-[2.6rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-navy sm:text-5xl lg:text-[3.4rem]">
            Just $17 a month. Four Years.{" "}
            <span className="relative whitespace-nowrap">
              <span className="text-gradient-brand">A Future Transformed.</span>
              <svg
                className="absolute -bottom-2 left-0 h-2.5 w-full text-brand/30"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9C48 3 152 2 198 7"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-slate-muted sm:text-base">
            CEB has carefully shortlisted 18 deserving students from hundreds of
            SSC and HSC dropouts. Your sponsorship can help them earn a Diploma in
            Engineering and build a future as skilled professionals.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/students">
                <Heart className="size-4" aria-hidden="true" />
                Support a Student
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/about">
                Learn About Our Mission
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-muted">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-brand" aria-hidden="true" />
              Verified student profiles
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
              Manual payment verification
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" />
            <span className="flex items-center gap-1.5">
              <Landmark className="size-4 text-brand" aria-hidden="true" />
              Fees paid to the institution
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[470px] lg:mx-0 lg:ml-auto">
          <div
            className="absolute -inset-5 rounded-[2.6rem] bg-brand-light/70 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative overflow-hidden rounded-[2rem] bg-navy p-5 shadow-[0_30px_80px_-30px_rgba(16,42,67,0.55)] sm:p-6">
            <div className="pattern-grid absolute inset-0 opacity-80" aria-hidden="true" />
            <div
              className="absolute -top-16 -right-16 size-52 rounded-full bg-brand/25 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Featured student
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Your support at work
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                <BadgeCheck className="size-3" />
                Verified
              </span>
            </div>

            <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <StudentAvatar
                  name={featuredStudent.fullName}
                  photoUrl={featuredStudent.photoUrl}
                  size="md"
                  className="ring-2 ring-white/20"
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-white">
                    {featuredStudent.fullName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-white/55">
                    <GraduationCap className="size-3.5 shrink-0" />
                    {featuredStudent.institution}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-end justify-between gap-3 text-[11px]">
                  <span className="font-bold text-white">
                    {formatMoney(funding.raised)}
                  </span>
                  <span className="text-right text-white/50">
                    of {formatMoney(funding.required)}
                  </span>
                </div>
                <FundingProgress
                  percent={funding.percent}
                  className="mt-2 h-2 bg-white/10"
                  barClassName="bg-gradient-to-r from-emerald-300 to-brand"
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10.5px] text-white/45">
                <span>{funding.percent}% funded</span>
                <span>
                  {funding.supporterCount} verified{" "}
                  {funding.supporterCount === 1 ? "supporter" : "supporters"}
                </span>
              </div>
            </div>

            <div className="relative mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
                <p className="text-[10px] text-white/45">Monthly support</p>
                <p className="mt-1 text-sm font-bold text-white">From $9 / month</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
                <p className="text-[10px] text-white/45">Verification</p>
                <p className="mt-1 text-sm font-bold text-white">Checked by our team</p>
              </div>
            </div>

            <Button asChild variant="white" className="relative mt-4 w-full">
              <Link href={`/students/${featuredStudent.slug}`}>
                Read {featuredStudent.fullName.split(" ")[0]}&apos;s story
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="absolute -top-5 -right-3 hidden items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-lg sm:flex">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <BadgeCheck className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-medium text-slate-muted">Donation checked</p>
              <p className="text-xs font-bold text-navy">Verified by our team</p>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 hidden items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-lg sm:flex">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-light text-brand-dark">
              <Heart className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-medium text-slate-muted">Paid directly</p>
              <p className="text-xs font-bold text-navy">To the institution</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
