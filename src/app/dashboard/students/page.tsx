import type { Metadata } from "next";
import { SupportedStudents } from "@/components/dashboard/supported-students";

export const metadata: Metadata = {
  title: "Supported students",
  description: "Students you have supported through verified donations.",
};

export default function DashboardStudentsPage() {
  return <SupportedStudents />;
}
