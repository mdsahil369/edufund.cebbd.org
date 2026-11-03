"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email.trim().toLowerCase(),
        {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/reset-password`
              : undefined,
        },
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      setSentEmail(values.email);
      setSent(true);
      toast.success("Password reset email sent.");
    } catch {
      toast.error("Could not send the reset email. Please try again.");
    }
  });

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)] sm:p-8">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-navy">Check your inbox</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-muted">
          If an account exists for{" "}
          <strong className="font-semibold text-ink">{sentEmail}</strong>, you will
          receive password reset instructions shortly.
        </p>
        <div className="mt-4 rounded-xl border border-brand/15 bg-brand-soft px-3 py-2.5 text-left text-[11px] leading-relaxed text-slate-muted">
          The link expires after a short time. If it has expired, request a new
          reset email.
        </div>
        <div className="mt-6 space-y-2">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Try a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)] sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">
        Reset your password
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-muted">
        Enter the email address linked to your donor or admin account. We will
        send you a secure link to reset your password.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
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

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {isSubmitting ? "Sending reset email…" : "Send reset email"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand transition-colors hover:text-brand-dark"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}
