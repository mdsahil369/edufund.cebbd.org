"use server";

import { createClient } from "@/lib/supabase/server";
import {
  toDonation,
  toDonor,
  type DonationRow,
  type DonorRow,
} from "@/lib/supabase/donors-mapper";
import type { Donation, Donor, DonorStatus } from "@/types";

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
