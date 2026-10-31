"use client";

import type { ReactNode } from "react";
import {
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell, type AppNavItem } from "@/components/layout/app-shell";
import { RoleGuard } from "@/components/layout/role-guard";
import { useDemoData } from "@/lib/store/demo-store";

export function AdminShell({ children }: { children: ReactNode }) {
  const { unreadAdminCount, donations } = useDemoData();
  const pendingCount = donations.filter(
    (donation) => donation.status === "pending",
  ).length;

  const nav: AppNavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/students", label: "Students", icon: GraduationCap },
    {
      href: "/admin/donations",
      label: "Donations",
      icon: HandCoins,
      badge: pendingCount,
    },
    {
      href: "/admin/messages",
      label: "Messages",
      icon: MessageSquare,
      badge: unreadAdminCount,
    },
    { href: "/admin/donors", label: "Donors", icon: HeartHandshake },
    {
      href: "/admin/payment-settings",
      label: "Payment Settings",
      icon: Landmark,
    },
    {
      href: "/admin/support-plans",
      label: "Support Plans",
      icon: SlidersHorizontal,
    },
    { href: "/admin/settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <RoleGuard role="admin">
      <AppShell variant="admin" nav={nav}>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
