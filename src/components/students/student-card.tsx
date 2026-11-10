import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { StudentAvatar } from "@/components/students/student-avatar";
import { FundingProgress } from "@/components/students/funding-progress";
import { StatusPill, campaignStatusTone } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { getCategoryName } from "@/lib/mock-data/categories";
import type { FundingSummary, PublicStudent } from "@/types";
import {
  avatarPalette,
  campaignStatusLabels,
  cn,
  formatMoney,
  truncate,
} from "@/lib/utils";

interface StudentCardProps {
  student: PublicStudent;
  funding: FundingSummary;
  className?: string;
  priority?: boolean;
}

export function StudentCard({
  student,
  funding,
  className,
  priority = false,
}: StudentCardProps) {
  const palette = avatarPalette(student.fullName);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_18px_40px_-24px_rgba(16,42,67,0.35)]",
        className,
      )}
    >
      <div
        className="relative h-28 overflow-hidden"
        style={{ backgroundImage: palette.backgroundImage }}
      >
        <div className="pattern-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="absolute -top-10 -right-8 size-36 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 left-16 size-32 rounded-full bg-black/10"
          aria-hidden="true"
        />
        <span className="absolute top-3.5 right-3.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold text-white backdrop-blur-sm">
          {getCategoryName(student.categoryId)}
        </span>
        <div className="absolute -bottom-8 left-5">
          <StudentAvatar
            name={student.fullName}
            photoUrl={student.photoUrl}
            size="lg"
            priority={priority}
            className="ring-4 ring-white"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-11 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-bold text-navy">
              <Link
                href={`/students/${student.slug}`}
                className="transition-colors hover:text-brand-dark"
              >
                {student.fullName}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {student.district}
              <span className="text-slate-300">•</span>
              <span className="truncate">{student.institution}</span>
            </p>
          </div>
          {student.campaignStatus !== "active" && (
            <StatusPill
              tone={campaignStatusTone(student.campaignStatus)}
              className="shrink-0"
            >
              {campaignStatusLabels[student.campaignStatus]}
            </StatusPill>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-muted">
          {truncate(student.shortBio, 118)}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-brand-dark">{formatMoney(funding.raised)}</p>
              <p className="mt-0.5 text-[11px] text-slate-muted">
                raised of {formatMoney(funding.required)}
              </p>
            </div>
            <span className="rounded-full bg-brand-light px-2 py-1 text-[11px] font-bold text-brand-dark">
              {funding.percent}%
            </span>
          </div>
          <FundingProgress percent={funding.percent} className="mt-2.5" />

          <div className="mt-5 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/students/${student.slug}`}>View Profile</Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href={`/students/${student.slug}/donate`}>
                Support
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
