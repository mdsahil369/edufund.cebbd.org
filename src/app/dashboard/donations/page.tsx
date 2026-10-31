import type { Metadata } from "next";
import { DonorDonations } from "@/components/dashboard/donor-donations";

export const metadata: Metadata = {
  title: "My donations",
  description: "Track your donation submissions and verification status.",
};

export default function DashboardDonationsPage() {
  return <DonorDonations />;
}
