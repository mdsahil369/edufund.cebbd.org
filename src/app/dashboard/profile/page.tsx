import type { Metadata } from "next";
import { DonorProfile } from "@/components/dashboard/donor-profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your donor profile and contact details.",
};

export default function DashboardProfilePage() {
  return <DonorProfile />;
}
