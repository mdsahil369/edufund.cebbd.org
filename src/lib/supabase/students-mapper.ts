import type { CampaignStatus, Student, StudentVisibility } from "@/types";

/**
 * Shape of a row in `public.students` (admin) or `public.public_students`
 * (public view). Private columns are optional because the public view does not
 * expose them.
 */
export interface StudentRow {
  id: string;
  slug: string;
  full_name: string;
  photo_url: string | null;
  gender: string | null;
  district: string;
  division: string;
  category_id: string;
  institution: string;
  headline: string;
  short_bio: string;
  story_family: string;
  story_challenges: string;
  story_ambitions: string;
  story_financial_needs: string;
  story_dreams: string;
  previous_exam: string;
  passing_year: number;
  result: string;
  future_goal: string;
  required_amount: number | string;
  campaign_status: string;
  visibility: string;
  featured: boolean;
  support_one_time: number[] | null;
  support_monthly: number | string;
  support_monthly_options?: number[] | null;
  support_yearly: number | string;
  support_full_scholarship: number | string;
  private_mobile?: string | null;
  private_father_name?: string | null;
  private_mother_name?: string | null;
  private_address?: string | null;
  private_guardian_occupation?: string | null;
  private_family_income?: number | string | null;
  private_admin_notes?: string | null;
  created_at: string;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toCampaignStatus(value: string): CampaignStatus {
  const allowed: CampaignStatus[] = [
    "active",
    "fully-funded",
    "completed",
    "paused",
    "draft",
  ];
  return allowed.includes(value as CampaignStatus)
    ? (value as CampaignStatus)
    : "draft";
}

function toVisibility(value: string): StudentVisibility {
  return value === "published" ? "published" : "unpublished";
}

export function toStudent(row: StudentRow): Student {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.full_name,
    photoUrl: row.photo_url ?? undefined,
    gender:
      row.gender === "male" || row.gender === "female" || row.gender === "other"
        ? row.gender
        : undefined,
    district: row.district,
    division: row.division,
    categoryId: row.category_id,
    institution: row.institution,
    headline: row.headline,
    shortBio: row.short_bio,
    story: {
      family: row.story_family,
      challenges: row.story_challenges,
      ambitions: row.story_ambitions,
      financialNeeds: row.story_financial_needs,
      dreams: row.story_dreams,
    },
    previousExam: row.previous_exam,
    passingYear: toNumber(row.passing_year),
    result: row.result,
    futureGoal: row.future_goal,
    requiredAmount: toNumber(row.required_amount),
    campaignStatus: toCampaignStatus(row.campaign_status),
    visibility: toVisibility(row.visibility),
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    supportPlans: {
      oneTimeOptions: (row.support_one_time ?? []).map((amount) =>
        toNumber(amount),
      ),
      monthly: toNumber(row.support_monthly),
      monthlyOptions: (row.support_monthly_options ?? []).map((amount) =>
        toNumber(amount),
      ),
      yearly: toNumber(row.support_yearly),
      fullScholarship: toNumber(row.support_full_scholarship),
    },
    privateInfo: {
      mobile: row.private_mobile ?? "",
      fatherName: row.private_father_name ?? "",
      motherName: row.private_mother_name ?? "",
      address: row.private_address ?? "",
      guardianOccupation: row.private_guardian_occupation ?? undefined,
      familyIncome:
        row.private_family_income === null ||
        row.private_family_income === undefined
          ? undefined
          : toNumber(row.private_family_income),
      adminNotes: row.private_admin_notes ?? undefined,
    },
  };
}

/** Converts a full `Student` into a row for insert/update statements. */
export function toStudentRow(student: Student) {
  return {
    id: student.id,
    slug: student.slug,
    full_name: student.fullName,
    photo_url: student.photoUrl ?? null,
    gender: student.gender ?? null,
    district: student.district,
    division: student.division,
    category_id: student.categoryId,
    institution: student.institution,
    headline: student.headline,
    short_bio: student.shortBio,
    story_family: student.story.family,
    story_challenges: student.story.challenges,
    story_ambitions: student.story.ambitions,
    story_financial_needs: student.story.financialNeeds,
    story_dreams: student.story.dreams,
    previous_exam: student.previousExam,
    passing_year: student.passingYear,
    result: student.result,
    future_goal: student.futureGoal,
    required_amount: student.requiredAmount,
    campaign_status: student.campaignStatus,
    visibility: student.visibility,
    featured: student.featured,
    support_one_time: student.supportPlans.oneTimeOptions,
    support_monthly: student.supportPlans.monthly,
    support_monthly_options: student.supportPlans.monthlyOptions,
    support_yearly: student.supportPlans.yearly,
    support_full_scholarship: student.supportPlans.fullScholarship,
    private_mobile: student.privateInfo.mobile,
    private_father_name: student.privateInfo.fatherName,
    private_mother_name: student.privateInfo.motherName,
    private_address: student.privateInfo.address,
    private_guardian_occupation: student.privateInfo.guardianOccupation ?? null,
    private_family_income: student.privateInfo.familyIncome ?? null,
    private_admin_notes: student.privateInfo.adminNotes ?? null,
    created_at: student.createdAt,
  };
}
