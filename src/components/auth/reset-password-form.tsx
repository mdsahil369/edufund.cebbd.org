"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      setHasSession(Boolean(session));
      setReady(true);
    };

    void check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (session) {
          setHasSession(true);
          setReady(true);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setFormError(error.message);
        toast.error(error.message);
        return;
      }

      await supabase.auth.signOut();
      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
    } catch {
      setFormError("Could not update your password. Please try again.");
    }
  });

  if (!ready) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)]">
        <Loader2 className="mx-auto size-6 animate-spin text-brand" />
        <p className="mt-3 text-[13px] text-slate-muted">
          Checking your reset link…
        </p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)] sm:p-8">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertCircle className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-navy">
          Reset link needed
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-muted">
          Open the password reset link from your email, or request a new one.
        </p>
        <Button asChild size="lg" className="mt-6 w-full">
          <Link href="/forgot-password">
            Request a new reset link
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Link
          href="/login"
          className="mt-4 inline-block text-[12.5px] font-semibold text-brand hover:text-brand-dark"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)] sm:p-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-2.5 py-1 text-[10.5px] font-semibold text-brand-dark">
          <CheckCircle2 className="size-3" />
          Secure reset
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy">
          Choose a new password
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-muted">
          Use at least 8 characters. You will sign in again with the new
          password.
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
          <label
            htmlFor="password"
            className="mb-1.5 block text-[12.5px] font-semibold text-ink"
          >
            New password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-[12.5px] font-semibold text-ink"
          >
            Confirm new password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-[11px] text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {isSubmitting ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
