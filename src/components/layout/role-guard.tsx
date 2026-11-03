"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useDemoData } from "@/lib/store/demo-store";

export function GuardLoading({ label = "Preparing your dashboard" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface">
      <Logo />
      <div className="flex items-center gap-2 text-sm text-slate-muted">
        <Loader2 className="size-4 animate-spin text-brand" />
        {label}
      </div>
    </div>
  );
}

interface RoleGuardProps {
  role: "donor" | "admin";
  children: ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const { hydrated, session } = useDemoData();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role !== role) {
      router.replace(session.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [hydrated, session, role, router]);

  if (!hydrated || !session || session.role !== role) {
    return <GuardLoading />;
  }

  return <>{children}</>;
}
