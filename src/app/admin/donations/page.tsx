import type { Metadata } from "next";
import { AdminDonations } from "@/components/admin/admin-donations";

export const metadata: Metadata = {
  title: "Donations",
  description: "Review and verify manual donation submissions.",
};

export default function AdminDonationsPage() {
  return <AdminDonations />;
}
