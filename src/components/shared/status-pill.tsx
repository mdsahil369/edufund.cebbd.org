import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info"
  | "brand";

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  brand: "border-brand/20 bg-brand-light text-brand-dark",
};

interface StatusPillProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export function StatusPill({
  tone = "neutral",
  children,
  className,
  dot = false,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function donationStatusTone(status: "pending" | "approved" | "rejected"): StatusTone {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

export function campaignStatusTone(
  status: "active" | "fully-funded" | "completed" | "paused" | "draft",
): StatusTone {
  switch (status) {
    case "active":
      return "brand";
    case "fully-funded":
      return "success";
    case "completed":
      return "info";
    case "paused":
      return "warning";
    default:
      return "neutral";
  }
}
