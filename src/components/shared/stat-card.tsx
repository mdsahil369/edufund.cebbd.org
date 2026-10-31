import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
  tone?: "default" | "brand" | "navy";
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  className,
  tone = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-muted">{label}</p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tracking-tight",
              tone === "brand" && "text-brand-dark",
              tone === "navy" && "text-navy",
            )}
          >
            {value}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
            tone === "brand"
              ? "bg-brand text-white"
              : tone === "navy"
                ? "bg-navy text-white"
                : "bg-brand-light text-brand-dark",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      {(hint || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "font-semibold",
                trend.positive === false ? "text-red-600" : "text-emerald-600",
              )}
            >
              {trend.value}
            </span>
          )}
          {hint && <span className="text-slate-muted">{hint}</span>}
        </div>
      )}
    </div>
  );
}
