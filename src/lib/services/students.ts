import { educationCategories } from "@/lib/mock-data/categories";
import { createPublicClient } from "@/lib/supabase/public";
import { toStudent, type StudentRow } from "@/lib/supabase/students-mapper";
import { fundingForStudent, getFundingTotals } from "@/lib/services/funding";
import type { EducationCategory, Student, StudentQuery } from "@/types";

/**
 * Data-access layer for public student content.
 *
 * Data comes from the `public_students` view in Supabase (published rows only,
 * private columns excluded). Admin changes therefore appear on the public site
 * immediately — no build step or redeploy needed.
 */

async function loadPublishedStudents(): Promise<Student[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("public_students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[students] Failed to load published students:", error.message);
      return [];
    }

    return ((data ?? []) as StudentRow[]).map(toStudent);
  } catch (error) {
    console.error(
      "[students] Supabase is not configured:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function getPublishedStudents(
  query: StudentQuery = {},
): Promise<Student[]> {
  const {
    search = "",
    categoryId,
    district,
    status = "all",
    sort = "newest",
  } = query;

  const normalizedSearch = search.trim().toLowerCase();

  let result = await loadPublishedStudents();

  if (normalizedSearch) {
    result = result.filter((student) => {
      const haystack = [
        student.fullName,
        student.institution,
        student.district,
        student.headline,
        student.shortBio,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  if (categoryId) {
    result = result.filter((student) => student.categoryId === categoryId);
  }

  if (district) {
    result = result.filter((student) => student.district === district);
  }

  if (status !== "all") {
    result = result.filter((student) => student.campaignStatus === status);
  }

  const sorted = [...result];
  switch (sort) {
    case "most-funded": {
      const totals = await getFundingTotals();
      sorted.sort(
        (a, b) =>
          fundingForStudent(b, totals).percent -
          fundingForStudent(a, totals).percent,
      );
      break;
    }
    case "most-needed": {
      const totals = await getFundingTotals();
      sorted.sort(
        (a, b) =>
          fundingForStudent(b, totals).remaining -
          fundingForStudent(a, totals).remaining,
      );
      break;
    }
    case "name-asc":
      sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
      break;
    case "newest":
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  return sorted;
}

export async function getFeaturedStudents(limit = 6): Promise<Student[]> {
  const published = await loadPublishedStudents();
  return published
    .filter(
      (student) =>
        student.featured &&
        student.visibility === "published" &&
        student.campaignStatus !== "completed",
    )
    .slice(0, limit);
}

export async function getStudentBySlug(slug: string): Promise<Student | null> {
  const published = await loadPublishedStudents();
  return published.find((student) => student.slug === slug) ?? null;
}

export async function getStudentById(id: string): Promise<Student | null> {
  const published = await loadPublishedStudents();
  return published.find((student) => student.id === id) ?? null;
}

export async function getEducationCategories(): Promise<EducationCategory[]> {
  return [...educationCategories]
    .filter((category) => category.active)
    .sort((a, b) => a.order - b.order);
}

export async function getDistricts(): Promise<string[]> {
  const published = await loadPublishedStudents();
  return [...new Set(published.map((student) => student.district))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function getPublishedStudentSlugs(): Promise<string[]> {
  const published = await loadPublishedStudents();
  return published.map((student) => student.slug);
}
