"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useDemoData } from "@/lib/store/demo-store";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Enter your full name.")
      .max(80, "Name is too long."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .max(20, "Phone number is too long.")
      .optional()
      .refine(
        (value) => !value || /^[0-9+\-\s()]{7,20}$/.test(value),
        "Enter a valid phone number.",
      ),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    terms: z.boolean().refine((value) => value, {
      message: "Please accept the terms and privacy policy.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerDonor } = useDemoData();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await registerDonor({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });

    if (!result.ok) {
      setFormError(result.error ?? "Could not create your account.");
      toast.error(result.error ?? "Could not create your account.");
      return;
    }

    if (result.needsEmailConfirmation) {
      setConfirmationEmail(values.email.trim().toLowerCase());
      toast.success("Check your email to confirm your account.");
      return;
    }

    toast.success("Your donor account is ready. Welcome to EduFund CEBBD.");
    router.push("/dashboard");
  });

  if (confirmationEmail) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)] sm:p-8">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand-dark">
          <Mail className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-navy">
          Confirm your email
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-muted">
          We sent a confirmation link to{" "}
          <strong className="font-semibold text-ink">{confirmationEmail}</strong>.
          Click the link in that email, then sign in to open your dashboard.
        </p>
        <div className="mt-6 space-y-2">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Go to sign in</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setConfirmationEmail(null);
              setFormError(null);
            }}
          >
            Use a different email
          </Button>
        </div>
        <p className="mt-4 text-[10.5px] leading-relaxed text-slate-muted">
          The link can take a minute to arrive. Check your spam folder if you do
          not see it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_18px_45px_-35px_rgba(16,42,67,0.4)] sm:p-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-2.5 py-1 text-[10.5px] font-semibold text-brand-dark">
          <ShieldCheck className="size-3" />
          Donor registration
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy">
          Create your donor account
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-muted">
          Support a student, follow their progress, and keep every donation
          record in one place.
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
          <label htmlFor="fullName" className="mb-1.5 block text-[12.5px] font-semibold text-ink">
            Full name
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Your full name"
              className="pl-9"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-[11px] text-red-600">{errors.fullName.message}</p>
          )}
        </div>

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
          <label htmlFor="phone" className="mb-1.5 block text-[12.5px] font-semibold text-ink">
            Phone number <span className="font-normal text-slate-muted">(optional)</span>
          </label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+880 1XXX-XXXXXX"
              className="pl-9"
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-[11px] text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-semibold text-ink">
              Password
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
            <label htmlFor="confirmPassword" className="mb-1.5 block text-[12.5px] font-semibold text-ink">
              Confirm password
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
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                  aria-invalid={Boolean(errors.terms)}
                />
              )}
            />
            <label htmlFor="terms" className="text-[11.5px] leading-relaxed text-slate-muted">
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-brand hover:text-brand-dark">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-brand hover:text-brand-dark"
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-[11px] text-red-600">{errors.terms.message}</p>
          )}
        </div>

        <p className="rounded-lg bg-surface px-3 py-2.5 text-[10.5px] leading-relaxed text-slate-muted">
          Your name is private by default. Donations appear as “Anonymous
          Supporter” until you choose to show your name in privacy settings.
        </p>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {isSubmitting ? "Creating your account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-slate-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}
