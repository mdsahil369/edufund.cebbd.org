import type { Metadata } from "next";
import { AdminPaymentSettings } from "@/components/admin/admin-payment-settings";

export const metadata: Metadata = {
  title: "Payment settings",
  description: "Manage bank, bKash, and Nagad instructions for manual donations.",
};

export default function AdminPaymentSettingsPage() {
  return <AdminPaymentSettings />;
}
