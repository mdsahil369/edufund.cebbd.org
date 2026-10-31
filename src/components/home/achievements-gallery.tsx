"use client";

import Image from "next/image";
import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface AchievementsGalleryProps {
  achievements: Achievement[];
  initialCount?: number;
  pageSize?: number;
  className?: string;
}

export function AchievementsGallery({
  achievements,
  initialCount = 3,
  pageSize = 3,
  className,
}: AchievementsGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(initialCount, achievements.length),
  );

  const visible = achievements.slice(0, visibleCount);
  const remaining = achievements.length - visible.length;

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((achievement, index) => (
          <article
            key={achievement.id}
            className={cn(
              "group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-28px_rgba(16,42,67,0.35)]",
              index >= initialCount && "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
            )}
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={achievement.image}
                alt={`${achievement.title} — CEBBD achievement artwork`}
                width={800}
                height={500}
                unoptimized
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute top-3 left-3 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                {achievement.category}
              </span>
              {achievement.metric && (
                <span className="absolute right-3 bottom-3 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold text-brand-dark">
                  {achievement.metric}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-muted">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDate(achievement.date, "d MMMM yyyy")}
              </p>
              <h3 className="mt-2 text-[16px] leading-snug font-bold text-navy">
                {achievement.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-slate-muted">
                {achievement.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisibleCount((count) => count + pageSize)}
            aria-label={`Load ${Math.min(pageSize, remaining)} more achievements`}
          >
            Read More Achievements
            <ChevronDown className="size-4" />
          </Button>
          <p className="text-[11px] text-slate-muted">
            {remaining} more {remaining === 1 ? "story" : "stories"} to explore
          </p>
        </div>
      )}
    </div>
  );
}
