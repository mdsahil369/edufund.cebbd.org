import type { EducationCategory } from "@/types";

/**
 * Fallback education categories.
 *
 * Supabase (`public.education_categories`) is the real source: the admin can add
 * categories and hide/show them there. This static list is only used when the
 * database is unreachable, so the public site keeps working. It mirrors the
 * seeded rows — University Admission and Higher Education are hidden for now.
 */
export const educationCategories: EducationCategory[] = [
  {
    id: "cat-diploma",
    name: "Diploma Scholarship",
    slug: "diploma-scholarship",
    description:
      "Polytechnic and technical diploma programmes for students who need support with admission and semester fees.",
    order: 1,
    active: true,
  },
  {
    id: "cat-university",
    name: "University Admission",
    slug: "university-admission",
    description:
      "Support for admission fees, preparation, and the first year of undergraduate study.",
    order: 2,
    active: false,
  },
  {
    id: "cat-higher",
    name: "Higher Education",
    slug: "higher-education",
    description:
      "Continuing support for students already enrolled in degree programmes who are at risk of dropping out.",
    order: 3,
    active: false,
  },
];

// Categories loaded from Supabase are cached here for synchronous label lookups
// in components that cannot await (student cards, admin tables).
let runtimeCategories: EducationCategory[] | null = null;

export function setRuntimeCategories(categories: EducationCategory[]) {
  runtimeCategories = categories;
}

export function getCategoryById(id: string) {
  return (
    runtimeCategories?.find((category) => category.id === id) ??
    educationCategories.find((category) => category.id === id)
  );
}

export function getCategoryName(id: string) {
  return getCategoryById(id)?.name ?? "Education support";
}
