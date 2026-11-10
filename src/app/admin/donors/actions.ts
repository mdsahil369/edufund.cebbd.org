"use server";

import { createClient } from "@/lib/supabase/server";
import {
  toDonation,
  toDonor,
  type DonationRow,
  type DonorRow,
} from "@/lib/supabase/donors-mapper";
import type { Donation, DonationType, Donor, DonorStatus, PaymentMethodId } from "@/types";

export type AdminDonorResult = { ok: true } | { ok: false; error: string };

export type AdminDonationResult =
  | { ok: true; donation: Donation }
  | { ok: false; error: string };

const UNAUTHORISED = "Only administrators can manage donors and donations.";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase: null,
      error: "Your session expired. Please sign in again.",
    };
  }

  if (user.app_metadata?.role !== "admin") {
    return { supabase: null, error: UNAUTHORISED };
  }

  return { supabase, user, error: null };
}

/** Every donor account with its full donation history (admin only). */
export async function listDonorsForAdminAction(): Promise<{
  donors: Donor[];
  donations: Donation[];
}> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) {
    console.error("[admin/donors] List blocked:", error);
    return { donors: [], donations: [] };
  }

  const [donorsResult, donationsResult] = await Promise.all([
    supabase.from("donors").select("*").order("created_at", { ascending: false }),
    supabase
      .from("donations")
      .select("*")
      .order("submitted_at", { ascending: false }),
  ]);

  if (donorsResult.error) {
    console.error(
      "[admin/donors] Failed to load donors:",
      donorsResult.error.message,
    );
  }
  if (donationsResult.error) {
    console.error(
      "[admin/donations] Failed to load donations:",
      donationsResult.error.message,
    );
  }

  return {
    donors: ((donorsResult.data ?? []) as DonorRow[]).map(toDonor),
    donations: ((donationsResult.data ?? []) as DonationRow[]).map(toDonation),
  };
}

export async function setDonorStatusAction(
  donorId: string,
  status: DonorStatus,
): Promise<AdminDonorResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  if (status !== "active" && status !== "suspended") {
    return { ok: false, error: "Choose a valid donor status." };
  }

  const { error: updateError } = await supabase
    .from("donors")
    .update({ status })
    .eq("id", donorId);

  if (updateError) {
    console.error("[admin/donors] Status update failed:", updateError.message);
    return { ok: false, error: "Could not update this donor's status." };
  }

  return { ok: true };
}

const donationTypes: DonationType[] = [
  "one-time",
  "monthly",
  "yearly",
  "full-scholarship",
];
const donationMethods: PaymentMethodId[] = [
  "bank-transfer",
  "bkash",
  "nagad",
  "card",
];

/**
 * Record a donation the team received personally (bank, bKash, or an
 * international transfer). Approved rows count toward the campaign immediately.
 */
export async function createManualDonationAction(input: {
  donorId: string;
  studentId: string;
  type: DonationType;
  amount: number;
  method: PaymentMethodId;
  transactionId?: string;
  senderReference?: string;
  paymentDate?: string;
  message?: string;
  status?: "pending" | "approved";
}): Promise<AdminDonationResult> {
  const { supabase, user, error } = await requireAdmin();
  if (!supabase || !user) {
    return { ok: false, error: error ?? UNAUTHORISED };
  }

  if (!input.donorId) {
    return { ok: false, error: "Choose the donor this payment belongs to." };
  }
  if (!input.studentId) {
    return { ok: false, error: "Choose the student this donation supports." };
  }
  if (!donationTypes.includes(input.type)) {
    return { ok: false, error: "Choose a valid support type." };
  }
  if (!donationMethods.includes(input.method)) {
    return { ok: false, error: "Choose a valid payment method." };
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount < 1) {
    return { ok: false, error: "Enter a donation amount greater than zero." };
  }

  const paymentDate = input.paymentDate?.trim() || new Date().toISOString().slice(0, 10);
  if (Number.isNaN(Date.parse(paymentDate))) {
    return { ok: false, error: "Enter a valid payment date." };
  }

  const status = input.status === "pending" ? "pending" : "approved";
  const transactionId =
    input.transactionId?.trim() ||
    `MANUAL-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;
  const senderReference =
    input.senderReference?.trim() || "Manual entry by CEBBD admin";

  const { data, error: insertError } = await supabase
    .from("donations")
    .insert({
      donor_id: input.donorId,
      student_id: input.studentId,
      type: input.type,
      amount,
      method: input.method,
      transaction_id: transactionId,
      sender_reference: senderReference,
      payment_date: paymentDate,
      message: input.message?.trim() || null,
      status,
      reviewed_at: status === "approved" ? new Date().toISOString() : null,
      reviewed_by: user.id,
      review_note:
        status === "approved" ? "Recorded manually by CEBBD admin" : null,
    })
    .select("*")
    .single();

  if (insertError || !data) {
    console.error(
      "[admin/donations] Manual insert failed:",
      insertError?.message ?? "No row returned",
    );
    if (insertError?.message.toLowerCase().includes("donations_transaction_id_key")) {
      return { ok: false, error: "This transaction ID has already been used." };
    }
    return { ok: false, error: "Could not add this donation. Please try again." };
  }

  return { ok: true, donation: toDonation(data as DonationRow) };
}

export async function updateDonorAdminNotesAction(
  donorId: string,
  notes: string,
): Promise<AdminDonorResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const trimmed = notes.trim();
  if (trimmed.length > 1000) {
    return { ok: false, error: "Keep the admin note under 1000 characters." };
  }

  const { error: updateError } = await supabase
    .from("donors")
    .update({ admin_notes: trimmed || null })
    .eq("id", donorId);

  if (updateError) {
    console.error("[admin/donors] Note update failed:", updateError.message);
    return { ok: false, error: "Could not save the admin note." };
  }

  return { ok: true };
}

/**
 * Approve or reject a pending donation. Approval is what adds the amount to the
 * student's public campaign total (the funding views count approved rows only).
 */
export async function reviewDonationAction(
  donationId: string,
  decision: "approved" | "rejected",
  note?: string,
): Promise<AdminDonationResult> {
  const { supabase, user, error } = await requireAdmin();
  if (!supabase || !user) {
    return { ok: false, error: error ?? UNAUTHORISED };
  }

  if (decision !== "approved" && decision !== "rejected") {
    return { ok: false, error: "Choose a valid review decision." };
  }

  const reviewNote = note?.trim() ?? "";
  if (decision === "rejected" && reviewNote.length < 3) {
    return {
      ok: false,
      error: "Add a review note so the donor knows why it was rejected.",
    };
  }
  if (reviewNote.length > 1000) {
    return { ok: false, error: "Keep the review note under 1000 characters." };
  }

  const { data, error: updateError } = await supabase
    .from("donations")
    .update({
      status: decision,
      review_note: reviewNote || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", donationId)
    .select("*")
    .single();

  if (updateError || !data) {
    console.error(
      "[admin/donations] Review failed:",
      updateError?.message ?? "No row returned",
    );
    return { ok: false, error: "Could not save this review. Please try again." };
  }

  return { ok: true, donation: toDonation(data as DonationRow) };
}
