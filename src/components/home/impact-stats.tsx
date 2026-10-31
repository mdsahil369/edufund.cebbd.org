import { GraduationCap, HandCoins, Megaphone, Users } from "lucide-react";
import type { ImpactStats } from "@/types";
import { formatCompactBDT, formatNumber } from "@/lib/utils";

interface ImpactStatsSectionProps {
  stats: ImpactStats;
}

export function ImpactStatsSection({ stats }: ImpactStatsSectionProps) {
  const items = [
    {
      icon: GraduationCap,
      value: `${formatNumber(stats.studentsSupported)}+`,
      label: "Students supported",
      detail: "Across all 64 districts",
    },
    {
      icon: HandCoins,
      value: formatCompactBDT(stats.fundsRaised),
      label: "Total funds raised",
      detail: "Verified donations only",
    },
    {
      icon: Megaphone,
      value: formatNumber(stats.activeCampaigns),
      label: "Active campaigns",
      detail: "Accepting support today",
    },
    {
      icon: Users,
      value: `${formatNumber(stats.communitySupporters)}+`,
      label: "Community supporters",
      detail: "Donors, partners, volunteers",
    },
  ];

  return (
    <section className="border-y border-border bg-white">
      <div className="container-page py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 lg:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={
                index > 0
                  ? "lg:border-l lg:border-border lg:pl-8"
                  : undefined
              }
            >
              <span className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
                <item.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <p className="text-2xl font-extrabold tracking-tight text-navy sm:text-[28px]">
                {item.value}
              </p>
              <p className="mt-1 text-[13px] font-semibold text-ink">
                {item.label}
              </p>
              <p className="mt-0.5 text-[11.5px] text-slate-muted">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 border-t border-dashed border-border pt-4 text-center text-[11px] text-slate-muted">
          Illustrative demo statistics for this frontend prototype. Live figures
          will come from the verified CEBBD database in Phase 2.
        </p>
      </div>
    </section>
  );
}
