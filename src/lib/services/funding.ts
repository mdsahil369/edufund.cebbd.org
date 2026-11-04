import { createPublicClient } from "@/lib/supabase/public";
import type {
  FundingSummary,
  FundingTotals,
  PublicSupporter,
  Student,
} from "@/types";

/**
 * Public funding data.
 *
 * `student_funding_summary` and `public_approved_donations` are read-only views
 * in Supabase that only expose approved donations, with donor names already
 * masked for anonymous supporters. Nothing here needs a signed-in session.
 */

interface FundingSummaryRow {
  student_id: string;
  raised: number | string;
  approved_donation_count: number | string;
  supporter_count: number | string;
}

interface PublicDonationRow {
  id: string;
  student_id: string;
  amount: number | string;
  type: string;
  payment_date: string;
  submitted_at: string;
  donor_name: string;
  is_anonymous: boolean;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getFundingTotals(): Promise<
  Record<string, FundingTotals>
> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("student_funding_summary")
      .select("*");

    if (error) {
      console.error("[funding] Failed to load totals:", error.message);
      return {};
    }

    return ((data ?? []) as FundingSummaryRow[]).reduce<
      Record<string, FundingTotals>
    >((totals, row) => {
      totals[row.student_id] = {
        raised: toNumber(row.raised),
        approvedDonationCount: toNumber(row.approved_donation_count),
        supporterCount: toNumber(row.supporter_count),
      };
      return totals;
    }, {});
  } catch (error) {
    console.error(
      "[funding] Supabase is not configured:",
      error instanceof Error ? error.message : error,
    );
    return {};
  }
}

/** Merge a student's target amount with the verified totals from Supabase. */
export function fundingForStudent(
  student: Pick<Student, "id" | "requiredAmount">,
  totals: Record<string, FundingTotals> = {},
): FundingSummary {
  const verified = totals[student.id] ?? {
    raised: 0,
    approvedDonationCount: 0,
    supporterCount: 0,
  };
  const required = student.requiredAmount;
  const raised = verified.raised;

  return {
    required,
    raised,
    remaining: Math.max(0, required - raised),
    percent:
      required > 0 ? Math.min(100, Math.round((raised / required) * 100)) : 0,
    approvedDonationCount: verified.approvedDonationCount,
    supporterCount: verified.supporterCount,
  };
}

const supporterTypes = ["one-time", "monthly", "yearly", "full-scholarship"];

export async function getRecentSupporters(
  studentId: string,
  limit = 5,
): Promise<PublicSupporter[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("public_approved_donations")
      .select("id, student_id, amount, type, payment_date, submitted_at, donor_name, is_anonymous")
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[funding] Failed to load supporters:", error.message);
      return [];
    }

    return ((data ?? []) as PublicDonationRow[]).map((row) => ({
      id: row.id,
      studentId: row.student_id,
      name: row.donor_name,
      amount: toNumber(row.amount),
      type: supporterTypes.includes(row.type)
        ? (row.type as PublicSupporter["type"])
        : "one-time",
      paymentDate: row.payment_date,
      submittedAt: row.submitted_at,
      anonymous: Boolean(row.is_anonymous),
    }));
  } catch (error) {
    console.error(
      "[funding] Supabase is not configured:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}
