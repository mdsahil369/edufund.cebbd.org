import type { Metadata } from "next";
import { AdminSupportPlans } from "@/components/admin/admin-support-plans";

export const metadata: Metadata = {
  title: "Support plans",
  description: "Configure per-student donation amounts and support options.",
};

export default function AdminSupportPlansPage() {
  return <AdminSupportPlans />;
}
