import type { Metadata } from "next";
import { AdminCategories } from "@/components/admin/admin-categories";
import { listCategoriesAction } from "./actions";

export const metadata: Metadata = {
  title: "Education categories",
  description: "Create education categories and hide or show them on the public site.",
};

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAction();
  return <AdminCategories categories={categories} />;
}
