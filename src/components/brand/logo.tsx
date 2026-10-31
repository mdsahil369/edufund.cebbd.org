import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  href?: string;
  compact?: boolean;
}

export function Logo({
  className,
  variant = "dark",
  href = "/",
  compact = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 focus-visible:rounded-lg",
        className,
      )}
      aria-label="EduFund CEBBD home"
    >
      <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand to-brand-deep shadow-[0_2px_8px_rgba(5,77,54,0.28)]">
        <svg
          viewBox="0 0 512 512"
          className="size-8"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M128 236 L256 168 L384 236 L256 304 Z" fill="#ffffff" />
          <path
            d="M170 270 L170 334 Q256 386 342 334 L342 270"
            fill="none"
            stroke="#ffffff"
            strokeWidth="26"
            strokeLinecap="round"
          />
          <path
            d="M384 236 L384 330"
            stroke="#ffffff"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <circle cx="384" cy="354" r="22" fill="#7ed0b0" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[19px] font-extrabold tracking-tight",
              variant === "light" ? "text-white" : "text-navy",
            )}
          >
            EduFund
          </span>
          <span
            className={cn(
              "mt-1 text-[10px] font-bold uppercase tracking-[0.22em]",
              variant === "light" ? "text-white/60" : "text-slate-muted",
            )}
          >
            CEBBD
          </span>
        </span>
      )}
    </Link>
  );
}
