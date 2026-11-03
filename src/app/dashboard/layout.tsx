import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DonorShell } from "@/components/layout/donor-shell";
import { createClient } from "@/lib/supabase/server";

// These routes read the Supabase session from cookies and must not be
// prerendered. `instant = false` opts the segment into blocking dynamic render.
export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "Donor dashboard",
    template: "%s | Donor dashboard | EduFund CEBBD",
  },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.app_metadata?.role === "admin") {
    redirect("/admin");
  }

  return <DonorShell>{children}</DonorShell>;
}
