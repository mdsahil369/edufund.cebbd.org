import type { EducationCategory } from "@/types";

/**
 * Education categories are data-driven. Adding a category here (or later in
 * Supabase) automatically makes it available in the public archive filters and
 * the admin student form — no UI changes required.
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
    active: true,
  },
  {
    id: "cat-higher",
    name: "Higher Education",
    slug: "higher-education",
    description:
      "Continuing support for students already enrolled in degree programmes who are at risk of dropping out.",
    order: 3,
    active: true,
  },
];

export function getCategoryById(id: string) {
  return educationCategories.find((category) => category.id === id);
}

export function getCategoryName(id: string) {
  return getCategoryById(id)?.name ?? "Education support";
}
