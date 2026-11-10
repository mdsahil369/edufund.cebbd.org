import Image from "next/image";
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
      <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
        <Image
          src="/cebbd.png"
          alt=""
          width={80}
          height={80}
          className="size-9 object-contain"
          priority
        />
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
