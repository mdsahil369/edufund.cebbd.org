import { donations } from "@/lib/mock-data/donations";
import { educationCategories } from "@/lib/mock-data/categories";
import { students } from "@/lib/mock-data/students";
import type { EducationCategory, Student, StudentQuery } from "@/types";
import { getFunding } from "@/lib/utils";

/**
 * Data-access layer for public student content.
 *
 * Every function is async so the mock implementation can be replaced with a
 * Supabase repository in Phase 2 without touching any UI component.
 */

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

  let result = students.filter((student) => student.visibility === "published");

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
    case "most-funded":
      sorted.sort(
        (a, b) =>
          getFunding(b, donations).percent - getFunding(a, donations).percent,
      );
      break;
    case "most-needed":
      sorted.sort(
        (a, b) =>
          getFunding(b, donations).remaining - getFunding(a, donations).remaining,
      );
      break;
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

export async function getAllStudents(): Promise<Student[]> {
  return [...students];
}

export async function getFeaturedStudents(limit = 6): Promise<Student[]> {
  return students
    .filter(
      (student) =>
        student.featured &&
        student.visibility === "published" &&
        student.campaignStatus !== "completed",
    )
    .slice(0, limit);
}

export async function getStudentBySlug(slug: string): Promise<Student | null> {
  return (
    students.find(
      (student) => student.slug === slug && student.visibility === "published",
    ) ?? null
  );
}

export async function getStudentById(id: string): Promise<Student | null> {
  return students.find((student) => student.id === id) ?? null;
}

export async function getEducationCategories(): Promise<EducationCategory[]> {
  return [...educationCategories]
    .filter((category) => category.active)
    .sort((a, b) => a.order - b.order);
}

export async function getDistricts(): Promise<string[]> {
  const published = students.filter(
    (student) => student.visibility === "published",
  );
  return [...new Set(published.map((student) => student.district))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function getPublishedStudentSlugs(): Promise<string[]> {
  return students
    .filter((student) => student.visibility === "published")
    .map((student) => student.slug);
}
