import {
  educationCategories,
  setRuntimeCategories,
} from "@/lib/mock-data/categories";
import { createPublicClient } from "@/lib/supabase/public";
import { toStudent, type StudentRow } from "@/lib/supabase/students-mapper";
import { fundingForStudent, getFundingTotals } from "@/lib/services/funding";
import type { EducationCategory, Student, StudentQuery } from "@/types";

/**
 * Data-access layer for public student content.
 *
 * Data comes from the `public_students` view in Supabase (published rows only,
 * private columns excluded), and categories come from
 * `public.education_categories`. Admin changes therefore appear on the public
 * site immediately — no build step or redeploy needed.
 */

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | string | null;
  active: boolean;
}

function toCategory(row: CategoryRow): EducationCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    order: Number(row.sort_order) || 0,
    active: Boolean(row.active),
  };
}

/**
 * Every category the current visitor may see. RLS already hides inactive rows
 * from anonymous visitors; admins see all of them.
 */
async function loadCategories(): Promise<EducationCategory[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("education_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[categories] Failed to load:", error.message);
      return [...educationCategories];
    }

    if (!data || data.length === 0) {
      return [...educationCategories];
    }

    const categories = (data as CategoryRow[]).map(toCategory);
    // Keep synchronous label lookups in sync with the database.
    setRuntimeCategories(categories);
    return categories;
  } catch (error) {
    console.error(
      "[categories] Supabase is not configured:",
      error instanceof Error ? error.message : error,
    );
    return [...educationCategories];
  }
}

/** Visible categories for the public archive and filters. */
export async function getEducationCategories(): Promise<EducationCategory[]> {
  const categories = await loadCategories();
  return categories
    .filter((category) => category.active)
    .sort((a, b) => a.order - b.order);
}

/** Look up a category (including hidden ones, for admin-style displays). */
export async function getEducationCategoryById(
  id: string,
): Promise<EducationCategory | null> {
  const categories = await loadCategories();
  return categories.find((category) => category.id === id) ?? null;
}

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

    const students = ((data ?? []) as StudentRow[]).map(toStudent);

    // A hidden category hides its students everywhere on the public site.
    const categories = await loadCategories();
    const activeIds = new Set(
      categories.filter((category) => category.active).map((category) => category.id),
    );

    if (activeIds.size === 0) return students;

    return students.filter((student) => activeIds.has(student.categoryId));
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

/**
 * Students for the homepage. Featured profiles come first, then the newest
 * verified profiles fill the grid, so the section always shows `limit` students
 * as long as enough are published.
 */
export async function getFeaturedStudents(limit = 6): Promise<Student[]> {
  const published = (await loadPublishedStudents())
    .filter((student) => student.campaignStatus !== "completed")
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return published.slice(0, limit);
}

export async function getStudentBySlug(slug: string): Promise<Student | null> {
  const published = await loadPublishedStudents();
  return published.find((student) => student.slug === slug) ?? null;
}

export async function getStudentById(id: string): Promise<Student | null> {
  const published = await loadPublishedStudents();
  return published.find((student) => student.id === id) ?? null;
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
