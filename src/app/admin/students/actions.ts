"use server";

import { createClient } from "@/lib/supabase/server";
import {
  toStudent,
  toStudentRow,
  type StudentRow,
} from "@/lib/supabase/students-mapper";
import type {
  CampaignStatus,
  FundingTotals,
  Student,
  StudentSupportPlans,
  StudentVisibility,
} from "@/types";

export type StudentActionResult = { ok: true } | { ok: false; error: string };

const UNAUTHORISED = "Only administrators can manage students.";

function describeError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("students_slug_key")) {
    return "This public URL slug is already used by another student.";
  }
  if (normalized.includes("students_pkey")) {
    return "This student id already exists.";
  }
  if (normalized.includes("row-level security")) {
    return "Your account does not have permission to change student records.";
  }

  return message;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, error: "Your session expired. Please sign in again." };
  }

  if (user.app_metadata?.role !== "admin") {
    return { supabase: null, error: UNAUTHORISED };
  }

  return { supabase, error: null };
}

/**
 * Students for the signed-in user. Admins get full rows (including private
 * info); everyone else gets the public view.
 */
export async function listStudentsAction(): Promise<Student[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const table =
    user.app_metadata?.role === "admin" ? "students" : "public_students";

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[students] Failed to load students:", error.message);
    return [];
  }

  return ((data ?? []) as StudentRow[]).map(toStudent);
}

/**
 * Verified totals for every campaign. Backed by the public
 * `student_funding_summary` view (approved donations only).
 */
export async function listFundingSummariesAction(): Promise<
  Record<string, FundingTotals>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data, error } = await supabase
    .from("student_funding_summary")
    .select("*");

  if (error) {
    console.error("[funding] Failed to load totals:", error.message);
    return {};
  }

  return (
    (data ?? []) as {
      student_id: string;
      raised: number | string;
      approved_donation_count: number | string;
      supporter_count: number | string;
    }[]
  ).reduce<Record<string, FundingTotals>>((totals, row) => {
    totals[row.student_id] = {
      raised: Number(row.raised) || 0,
      approvedDonationCount: Number(row.approved_donation_count) || 0,
      supporterCount: Number(row.supporter_count) || 0,
    };
    return totals;
  }, {});
}

export async function createStudentAction(
  student: Student,
): Promise<StudentActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const { error: insertError } = await supabase
    .from("students")
    .insert(toStudentRow(student));

  if (insertError) {
    return { ok: false, error: describeError(insertError.message) };
  }

  return { ok: true };
}

export async function updateStudentAction(
  id: string,
  student: Student,
): Promise<StudentActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const { id: _id, ...row } = toStudentRow(student);

  const { error: updateError } = await supabase
    .from("students")
    .update(row)
    .eq("id", id);

  if (updateError) {
    return { ok: false, error: describeError(updateError.message) };
  }

  return { ok: true };
}

export async function deleteStudentAction(id: string): Promise<StudentActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const { error: deleteError } = await supabase
    .from("students")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { ok: false, error: describeError(deleteError.message) };
  }

  return { ok: true };
}

export async function setStudentVisibilityAction(
  id: string,
  visibility: StudentVisibility,
): Promise<StudentActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const { error: updateError } = await supabase
    .from("students")
    .update({ visibility })
    .eq("id", id);

  if (updateError) {
    return { ok: false, error: describeError(updateError.message) };
  }

  return { ok: true };
}

export async function setStudentStatusAction(
  id: string,
  status: CampaignStatus,
): Promise<StudentActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const { error: updateError } = await supabase
    .from("students")
    .update({ campaign_status: status })
    .eq("id", id);

  if (updateError) {
    return { ok: false, error: describeError(updateError.message) };
  }

  return { ok: true };
}

export async function setStudentSupportPlansAction(
  id: string,
  plans: StudentSupportPlans,
): Promise<StudentActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const { error: updateError } = await supabase
    .from("students")
    .update({
      support_one_time: plans.oneTimeOptions,
      support_monthly: plans.monthly,
      support_yearly: plans.yearly,
      support_full_scholarship: plans.fullScholarship,
    })
    .eq("id", id);

  if (updateError) {
    return { ok: false, error: describeError(updateError.message) };
  }

  return { ok: true };
}
