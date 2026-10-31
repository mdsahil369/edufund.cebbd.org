import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Overview",
  description: "Your giving at a glance.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
