import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create a donor account",
  description:
    "Create an EduFund CEBBD donor account to support students and track your verified donations.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
