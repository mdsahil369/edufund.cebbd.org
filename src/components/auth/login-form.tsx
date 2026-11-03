"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemoData } from "@/lib/store/demo-store";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useDemoData();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await login(values.email, values.password);
    if (!result.ok) {
      setFormError(result.error ?? "Could not sign you in.");
      toast.error(result.error ?? "Could not sign you in.");
      return;
    }
    toast.success(
      result.role === "admin"
        ? "Signed in to the admin dashboard."
        : "Welcome back to EduFund CEBBD.",
    );
    router.push(result.role === "admin" ? "/admin" : "/dashboard");
  });

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)] sm:p-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-2.5 py-1 text-[10.5px] font-semibold text-brand-dark">
          <ShieldCheck className="size-3" />
          Donor & admin access
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-muted">
          Sign in to track your donations, follow supported students, and message
          the CEBBD team.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {formError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-semibold text-ink">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-9"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-[12.5px] font-semibold text-ink">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pl-9"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-slate-muted">
        New to EduFund CEBBD?{" "}
        <Link href="/register" className="font-semibold text-brand hover:text-brand-dark">
          Create a donor account
        </Link>
      </p>

      <p className="mt-3 rounded-lg bg-surface px-3 py-2.5 text-center text-[10.5px] leading-relaxed text-slate-muted">
        Admin accounts are created and managed by the CEBBD team. Use the same
        form to sign in with your admin email and password.
      </p>
    </div>
  );
}
