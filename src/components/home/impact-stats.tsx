import { BadgeCheck, FileCheck2, Landmark, LayoutDashboard } from "lucide-react";

/**
 * Trust strip below the hero.
 *
 * Deliberately number-free: CEBBD has not published verified programme totals
 * yet, so this section explains *how* the programme works instead of quoting
 * figures that cannot be confirmed.
 */
const items = [
  {
    icon: FileCheck2,
    title: "Every profile verified",
    detail:
      "Applications are reviewed by our team, including a home and institute visit, before a student is published.",
  },
  {
    icon: BadgeCheck,
    title: "Manual payment checks",
    detail:
      "A finance team member matches every transaction ID before a donation counts toward a campaign.",
  },
  {
    icon: Landmark,
    title: "Fees paid to institutes",
    detail:
      "Approved support is paid to the student's polytechnic against their account — never handed over in cash.",
  },
  {
    icon: LayoutDashboard,
    title: "Transparent dashboard",
    detail:
      "Donors track each donation from pending to approved, and can choose to stay anonymous on public pages.",
  },
];

export function ImpactStatsSection() {
  return (
    <section className="border-y border-border bg-white">
      <div className="container-page py-10 sm:py-12">
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.title}
              className={
                index > 0 ? "lg:border-l lg:border-border lg:pl-6" : undefined
              }
            >
              <span className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
                <item.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <p className="text-[14px] font-bold text-navy">{item.title}</p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-muted">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
