import type { Metadata } from "next";
import { AdminStudents } from "@/components/admin/admin-students";

export const metadata: Metadata = {
  title: "Students",
  description: "Create and manage student campaigns.",
};

export default function AdminStudentsPage() {
  return <AdminStudents />;
}
