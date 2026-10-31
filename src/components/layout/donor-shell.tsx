"use client";

import type { ReactNode } from "react";
import {
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AppShell, type AppNavItem } from "@/components/layout/app-shell";
import { RoleGuard } from "@/components/layout/role-guard";
import { useDemoData } from "@/lib/store/demo-store";

export function DonorShell({ children }: { children: ReactNode }) {
  const { unreadDonorCount } = useDemoData();

  const nav: AppNavItem[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/donations", label: "My Donations", icon: HandCoins },
    {
      href: "/dashboard/students",
      label: "Supported Students",
      icon: GraduationCap,
    },
    {
      href: "/dashboard/messages",
      label: "My Messages",
      icon: MessageSquare,
      badge: unreadDonorCount,
    },
    { href: "/dashboard/profile", label: "My Profile", icon: UserRound },
    { href: "/dashboard/privacy", label: "Privacy Settings", icon: ShieldCheck },
  ];

  return (
    <RoleGuard role="donor">
      <AppShell variant="donor" nav={nav}>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
