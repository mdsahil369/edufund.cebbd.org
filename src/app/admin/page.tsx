import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = {
  title: "Overview",
  description: "Fundraising, campaign, and verification overview.",
};

export default function AdminPage() {
  return <AdminOverview />;
}
