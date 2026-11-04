"use server";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  toDonation,
  toDonor,
  type DonationRow,
  type DonorRow,
} from "@/lib/supabase/donors-mapper";
import type { Donation, DonationInput, Donor } from "@/types";

export type DonorActionResult = { ok: true } | { ok: false; error: string };

const UNAUTHENTICATED = "Your session expired. Please sign in again.";

export interface DonorAccountData {
  donor: Donor | null;
  donations: Donation[];
}

function displayNameFor(user: User): string {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  if (fullName) return fullName;

  const name = typeof metadata.name === "string" ? metadata.name.trim() : "";
  if (name) return name;

  return user.email?.split("@")[0] ?? "Supporter";
}

function describeError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("donations_transaction_id_key")) {
    return "This transaction ID has already been submitted. Please check your payment receipt and try again.";
  }
  if (normalized.includes("row-level security")) {
    return "This action is not allowed. The campaign may have closed, or your donor account may be suspended.";
  }
  if (normalized.includes("donations_amount_check")) {
    return "Enter a donation amount greater than zero.";
  }
  if (normalized.includes("donations_student_id_fkey")) {
    return "This student could not be found.";
  }
  if (normalized.includes("does not exist") || normalized.includes("schema cache")) {
    return "The donor database is not set up yet. Run supabase/donors-schema.sql in Supabase.";
  }

  return message;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Returns the signed-in user's donor profile, creating the row if the
 * `handle_new_donor` trigger has not run for an older account yet.
 */
async function ensureDonorProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
): Promise<DonorRow | null> {
  const { data, error } = await supabase
    .from("donors")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!error && data) return data as DonorRow;

  if (error) {
    console.error("[donors] Failed to load profile:", error.message);
  }

  const metadata = user.user_metadata ?? {};
  const phone =
    typeof metadata.phone === "string" && metadata.phone.trim()
      ? metadata.phone.trim()
      : null;

  const { error: insertError } = await supabase.from("donors").upsert(
    {
      id: user.id,
      full_name: displayNameFor(user),
      email: user.email ?? "",
      phone,
      show_name_publicly: false,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (insertError) {
    console.error("[donors] Failed to create profile:", insertError.message);
    return null;
  }

  const { data: created } = await supabase
    .from("donors")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (created as DonorRow | null) ?? null;
}

/**
 * Everything the donor dashboard needs: their own profile and donation
 * history. Admin accounts get an empty result (they use the admin actions).
 */
export async function loadDonorAccountAction(): Promise<DonorAccountData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role === "admin") {
    return { donor: null, donations: [] };
  }

  const profile = await ensureDonorProfile(supabase, user);
  if (!profile) return { donor: null, donations: [] };

  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("donor_id", user.id)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("[donations] Failed to load donor donations:", error.message);
  }

  return {
    donor: toDonor(profile),
    donations: ((data ?? []) as DonationRow[]).map(toDonation),
  };
}

export async function updateDonorProfileAction(patch: {
  fullName?: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}): Promise<DonorActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: UNAUTHENTICATED };

  const update: Record<string, string | null> = {};

  if (patch.fullName !== undefined) {
    const fullName = patch.fullName.trim();
    if (fullName.length < 2 || fullName.length > 80) {
      return { ok: false, error: "Enter a name between 2 and 80 characters." };
    }
    update.full_name = fullName;
  }

  if (patch.phone !== undefined) {
    const phone = patch.phone?.trim() ?? "";
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return { ok: false, error: "Enter a valid phone number." };
    }
    update.phone = phone || null;
  }

  if (patch.address !== undefined) {
    const address = patch.address?.trim() ?? "";
    if (address.length > 160) {
      return { ok: false, error: "Keep your address under 160 characters." };
    }
    update.address = address || null;
  }

  if (patch.bio !== undefined) {
    const bio = patch.bio?.trim() ?? "";
    if (bio.length > 300) {
      return { ok: false, error: "Keep your bio under 300 characters." };
    }
    update.bio = bio || null;
  }

  if (patch.avatarUrl !== undefined) {
    const avatarUrl = patch.avatarUrl?.trim() ?? "";
    if (avatarUrl && !isValidHttpUrl(avatarUrl)) {
      return { ok: false, error: "The profile photo URL is not valid." };
    }
    update.avatar_url = avatarUrl || null;
  }

  if (Object.keys(update).length === 0) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("donors")
    .update(update)
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: describeError(error.message) };
  }

  return { ok: true };
}

export async function setDonorPrivacyAction(
  showNamePublicly: boolean,
): Promise<DonorActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: UNAUTHENTICATED };

  const { error } = await supabase
    .from("donors")
    .update({ show_name_publicly: showNamePublicly })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: describeError(error.message) };
  }

  return { ok: true };
}

const donationTypes = ["one-time", "monthly", "yearly", "full-scholarship"];
const paymentMethods = ["bank-transfer", "bkash", "nagad"];

export async function submitDonationAction(
  input: DonationInput,
): Promise<{ ok: true; donation: Donation } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please sign in as a donor to donate." };
  }

  if (user.app_metadata?.role === "admin") {
    return {
      ok: false,
      error: "Admin accounts cannot submit donations. Sign in as a donor.",
    };
  }

  if (!donationTypes.includes(input.type)) {
    return { ok: false, error: "Choose a valid support type." };
  }
  if (!paymentMethods.includes(input.method)) {
    return { ok: false, error: "Choose a valid payment method." };
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount < 100) {
    return { ok: false, error: "The minimum donation is ৳100." };
  }

  const transactionId = input.transactionId.trim();
  if (transactionId.length < 6 || transactionId.length > 80) {
    return {
      ok: false,
      error: "Enter the transaction ID from your payment receipt.",
    };
  }

  const senderReference = input.senderReference.trim();
  if (senderReference.length < 4 || senderReference.length > 80) {
    return {
      ok: false,
      error: "Enter the sender number or account reference.",
    };
  }

  const paymentDate = input.paymentDate?.trim();
  if (!paymentDate || Number.isNaN(Date.parse(paymentDate))) {
    return { ok: false, error: "Select the date you made the payment." };
  }

  const profile = await ensureDonorProfile(supabase, user);
  if (!profile) {
    return {
      ok: false,
      error: "We could not load your donor profile. Please refresh and try again.",
    };
  }
  if (profile.status === "suspended") {
    return {
      ok: false,
      error: "Your donor account is suspended. Please contact CEBBD support.",
    };
  }

  const message = input.message?.trim();
  if (message && message.length > 500) {
    return { ok: false, error: "Please keep your message under 500 characters." };
  }

  const { data, error } = await supabase
    .from("donations")
    .insert({
      // The donor id always comes from the session, never from the browser.
      donor_id: user.id,
      student_id: input.studentId,
      type: input.type,
      amount,
      method: input.method,
      transaction_id: transactionId,
      sender_reference: senderReference,
      payment_date: paymentDate,
      message: message || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: describeError(error?.message ?? "Could not submit your donation."),
    };
  }

  return { ok: true, donation: toDonation(data as DonationRow) };
}
