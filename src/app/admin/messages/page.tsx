import type { Metadata } from "next";
import { AdminMessages } from "@/components/admin/admin-messages";

export const metadata: Metadata = {
  title: "Messages",
  description: "Reply to donor conversations on behalf of students.",
};

export default function AdminMessagesPage() {
  return <AdminMessages />;
}
