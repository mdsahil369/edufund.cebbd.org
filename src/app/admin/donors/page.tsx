import type { Metadata } from "next";
import { AdminDonors } from "@/components/admin/admin-donors";

export const metadata: Metadata = {
  title: "Donors",
  description: "View donor accounts and verified giving history.",
};

export default function AdminDonorsPage() {
  return <AdminDonors />;
}
