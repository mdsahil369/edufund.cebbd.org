import type { Metadata } from "next";
import { AdminSiteSettings } from "@/components/admin/admin-site-settings";

export const metadata: Metadata = {
  title: "Site settings",
  description: "Manage public site details and demo data.",
};

export default function AdminSettingsPage() {
  return <AdminSiteSettings />;
}
