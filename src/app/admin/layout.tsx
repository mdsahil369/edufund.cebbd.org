import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { createClient } from "@/lib/supabase/server";

// These routes read the Supabase session from cookies and must not be
// prerendered. `instant = false` opts the segment into blocking dynamic render.
export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "Admin dashboard",
    template: "%s | Admin | EduFund CEBBD",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
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

  if (user.app_metadata?.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
