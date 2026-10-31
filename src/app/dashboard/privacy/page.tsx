import type { Metadata } from "next";
import { DonorPrivacy } from "@/components/dashboard/donor-privacy";

export const metadata: Metadata = {
  title: "Privacy settings",
  description: "Control how your identity appears on public pages.",
};

export default function DashboardPrivacyPage() {
  return <DonorPrivacy />;
}
