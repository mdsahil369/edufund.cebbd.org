import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your EduFund CEBBD donor account to track donations, supported students, and messages.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginForm />;
}
