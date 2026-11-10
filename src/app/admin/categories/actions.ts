"use server";

import { createClient } from "@/lib/supabase/server";
import type { EducationCategory } from "@/types";
import { slugify } from "@/lib/utils";

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; error: string };

const UNAUTHORISED = "Only administrators can manage categories.";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | string | null;
  active: boolean;
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
  return { supabase, user, error: null };
}

/** All categories, including hidden ones (admin only). */
export async function listCategoriesAction(): Promise<EducationCategory[]> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) {
    console.error("[admin/categories] List blocked:", error);
    return [];
  }

  const { data, error: loadError } = await supabase
    .from("education_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (loadError) {
    console.error("[admin/categories] Failed to load:", loadError.message);
    return [];
  }

  return ((data ?? []) as CategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    order: Number(row.sort_order) || 0,
    active: Boolean(row.active),
  }));
}

export async function createCategoryAction(input: {
  name: string;
  description?: string;
}): Promise<CategoryActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const name = input.name.trim();
  if (name.length < 3 || name.length > 60) {
    return { ok: false, error: "Enter a category name between 3 and 60 characters." };
  }

  const description = input.description?.trim() ?? "";
  if (description.length > 300) {
    return { ok: false, error: "Keep the description under 300 characters." };
  }

  const slug = slugify(name);
  if (!slug) {
    return { ok: false, error: "Use letters and numbers in the category name." };
  }

  const { data: existing, error: orderError } = await supabase
    .from("education_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    console.error("[admin/categories] Order lookup failed:", orderError.message);
  }

  const sortOrder = (Number(existing?.sort_order) || 0) + 1;

  const { error: insertError } = await supabase
    .from("education_categories")
    .insert({
      id: `cat-${slug}`,
      name,
      slug,
      description,
      sort_order: sortOrder,
      active: true,
    });

  if (insertError) {
    console.error("[admin/categories] Create failed:", insertError.message);
    if (insertError.message.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "A category with this name already exists." };
    }
    return { ok: false, error: "Could not create this category. Please try again." };
  }

  return { ok: true };
}

export async function setCategoryActiveAction(
  id: string,
  active: boolean,
): Promise<CategoryActionResult> {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return { ok: false, error: error ?? UNAUTHORISED };

  const { error: updateError } = await supabase
    .from("education_categories")
    .update({ active })
    .eq("id", id);

  if (updateError) {
    console.error("[admin/categories] Update failed:", updateError.message);
    return { ok: false, error: "Could not update this category." };
  }

  return { ok: true };
}
