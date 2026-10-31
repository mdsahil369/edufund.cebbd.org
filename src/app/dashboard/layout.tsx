import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DonorShell } from "@/components/layout/donor-shell";

export const metadata: Metadata = {
  title: {
    default: "Donor dashboard",
    template: "%s | Donor dashboard | EduFund CEBBD",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DonorShell>{children}</DonorShell>;
}
