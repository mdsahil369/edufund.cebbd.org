"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FundingProgressProps {
  percent: number;
  className?: string;
  barClassName?: string;
  trackClassName?: string;
  label?: string;
  animate?: boolean;
}

export function FundingProgress({
  percent,
  className,
  barClassName,
  trackClassName,
  label,
  animate = true,
}: FundingProgressProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", trackClassName, className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label ?? `${clamped}% funded`}
    >
      {animate ? (
        <motion.div
          className={cn("h-full rounded-full bg-brand", barClassName)}
          initial={{ width: 0 }}
          whileInView={{ width: `${clamped}%` }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <div
          className={cn("h-full rounded-full bg-brand transition-[width] duration-700", barClassName)}
          style={{ width: `${clamped}%` }}
        />
      )}
    </div>
  );
}
