"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/student-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/lib/store/demo-store";
import { createClient } from "@/lib/supabase/client";
import type { Donor } from "@/types";
import { formatDate } from "@/lib/utils";

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
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
  address: z.string().trim().max(160, "Address is too long.").optional(),
  bio: z.string().trim().max(300, "Keep your bio under 300 characters.").optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function DonorProfile() {
  const { session, hydrated, accountReady, donors } = useDemoData();

  if (!hydrated || !accountReady || !session) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="h-80 animate-pulse rounded-2xl bg-white" />
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  const donor = donors.find((item) => item.id === session.donorId);
  if (!donor) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <p className="text-[13px] text-slate-muted">
          We could not find your donor profile. Please sign out and sign in again.
        </p>
      </div>
    );
  }

  return <ProfileForm donor={donor} />;
}

function ProfileForm({ donor }: { donor: Donor }) {
  const { updateDonorProfile } = useDemoData();
  const [avatar, setAvatar] = useState<string | undefined>(donor.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: donor.fullName,
      email: donor.email,
      phone: donor.phone ?? "",
      address: donor.address ?? "",
      bio: donor.bio ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateDonorProfile({
      fullName: values.fullName,
      phone: values.phone?.trim() || null,
      address: values.address?.trim() || null,
      bio: values.bio?.trim() || null,
      avatarUrl: avatar ?? null,
    });

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    reset(values);
    toast.success("Profile updated.");
  });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please choose an image smaller than 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // Files are stored under <donor id>/ so the storage policy only lets the
      // donor write inside their own folder.
      const path = `${donor.id}/avatar-${Date.now()}.${extension}`;

      const { error } = await supabase.storage
        .from("donor-avatars")
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("donor-avatars")
        .getPublicUrl(path);

      setAvatar(data.publicUrl);
      toast.success("Photo ready. Save changes to apply it.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload your photo. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Keep your donor details up to date. Your contact information is never shown publicly."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <StudentAvatar
                name={donor.fullName}
                photoUrl={avatar}
                size="xl"
                className="ring-4 ring-brand-light"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -right-1 -bottom-1 inline-flex size-9 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-md transition-colors hover:bg-brand-dark disabled:opacity-70"
                aria-label="Upload profile photo"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </div>
            <h2 className="mt-3 text-[15px] font-bold text-navy">
              {donor.fullName}
            </h2>
            <p className="text-[11.5px] text-slate-muted">{donor.email}</p>
            <StatusPill tone="success" className="mt-2">
              Active donor
            </StatusPill>
            <div className="mt-4 flex w-full gap-2">
              <Button
                variant="outline"
                size="xs"
                className="flex-1"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Change photo"}
              </Button>
              {avatar && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove photo"
                  onClick={() => {
                    setAvatar(undefined);
                    toast.info("Photo removed. Save changes to apply it.");
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-border pt-4 text-[11.5px]">
            <div className="flex items-center justify-between">
              <dt className="text-slate-muted">Member since</dt>
              <dd className="font-semibold text-ink">
                {formatDate(donor.joinedAt, "MMMM yyyy")}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-muted">Donor ID</dt>
              <dd className="font-mono text-[10.5px] font-semibold text-ink">
                {donor.id.slice(0, 8).toUpperCase()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-muted">Public name</dt>
              <dd className="font-semibold text-ink">
                {donor.showNamePublicly ? "Shown" : "Anonymous"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-xl border border-brand/15 bg-brand-soft p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-dark">
              <ShieldCheck className="size-3.5" />
              Privacy reminder
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-slate-muted">
              Your name appears as “Anonymous Supporter” by default. You can change
              this anytime in privacy settings.
            </p>
            <Button asChild variant="outline" size="xs" className="mt-2 w-full bg-white">
              <Link href="/dashboard/privacy">Manage privacy</Link>
            </Button>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-white shadow-sm"
          noValidate
        >
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[15px] font-bold text-navy">Personal information</h2>
            <p className="mt-0.5 text-[11px] text-slate-muted">
              Used for donation receipts and verification only.
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-[12px] font-semibold text-ink"
                >
                  Full name
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
                    aria-hidden="true"
                  />
                  <Input
                    id="fullName"
                    className="pl-9"
                    aria-invalid={Boolean(errors.fullName)}
                    {...register("fullName")}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[12px] font-semibold text-ink"
                >
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
                    readOnly
                    className="bg-muted/60 pl-9"
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                  />
                </div>
                {errors.email ? (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.email.message}
                  </p>
                ) : (
                  <p className="mt-1 text-[10.5px] text-slate-muted">
                    This is your sign-in email. Contact CEBBD support to change it.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-[12px] font-semibold text-ink"
                >
                  Phone number{" "}
                  <span className="font-normal text-slate-muted">(optional)</span>
                </label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
                    aria-hidden="true"
                  />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-9"
                    aria-invalid={Boolean(errors.phone)}
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-[12px] font-semibold text-ink"
                >
                  City / address{" "}
                  <span className="font-normal text-slate-muted">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
                    aria-hidden="true"
                  />
                  <Input
                    id="address"
                    className="pl-9"
                    placeholder="Dhaka, Bangladesh"
                    aria-invalid={Boolean(errors.address)}
                    {...register("address")}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="mb-1.5 block text-[12px] font-semibold text-ink"
              >
                About you{" "}
                <span className="font-normal text-slate-muted">(optional)</span>
              </label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Why do you support education?"
                aria-invalid={Boolean(errors.bio)}
                {...register("bio")}
              />
              <p className="mt-1 text-[10.5px] text-slate-muted">
                This is only visible to the CEBBD team, never on public pages.
              </p>
              {errors.bio && (
                <p className="mt-1 text-[11px] text-red-600">
                  {errors.bio.message}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface px-3.5 py-3 text-[11px] leading-relaxed text-slate-muted">
              <CheckCircle2 className="mr-1 inline size-3.5 text-emerald-600" />
              Saved to your Supabase donor profile. Contact details are never
              exposed to students or the public.
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  reset({
                    fullName: donor.fullName,
                    email: donor.email,
                    phone: donor.phone ?? "",
                    address: donor.address ?? "",
                    bio: donor.bio ?? "",
                  })
                }
                disabled={!isDirty}
              >
                Discard changes
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
