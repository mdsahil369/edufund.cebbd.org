"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  FolderPlus,
  GraduationCap,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { EducationCategory } from "@/types";
import { cn } from "@/lib/utils";
import {
  createCategoryAction,
  setCategoryActiveAction,
} from "@/app/admin/categories/actions";

interface AdminCategoriesProps {
  categories: EducationCategory[];
}

export function AdminCategories({ categories }: AdminCategoriesProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const create = async () => {
    if (creating) return;
    setCreating(true);
    const result = await createCategoryAction({ name, description });
    setCreating(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Category created. It is visible on the public site.");
    setName("");
    setDescription("");
    router.refresh();
  };

  const toggle = async (category: EducationCategory) => {
    setBusyId(category.id);
    const result = await setCategoryActiveAction(category.id, !category.active);
    setBusyId(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      category.active
        ? `${category.name} is now hidden, including its students.`
        : `${category.name} is now visible on the public site.`,
    );
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Education Categories"
        description="Create categories and control what appears on the public site. Hiding a category also hides every student in it from /students and the homepage."
        action={
          <div className="inline-flex items-center gap-2 rounded-lg border border-brand/15 bg-brand-soft px-3 py-2 text-[11.5px] text-brand-dark">
            <Lock className="size-4" />
            Admin controlled
          </div>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[14px] font-bold text-navy">All categories</h2>
            <p className="mt-0.5 text-[10.5px] text-slate-muted">
              Hidden categories keep their students and settings — they are only
              removed from public listings until you show them again.
            </p>
          </div>

          <ul className="divide-y divide-border">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                      category.active
                        ? "bg-brand-light text-brand-dark"
                        : "bg-muted text-slate-muted",
                    )}
                  >
                    <GraduationCap className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-ink">
                      {category.name}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                          category.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {category.active ? "Visible" : "Hidden"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-muted">
                      {category.description || "No description yet."}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggle(category)}
                    disabled={busyId === category.id}
                  >
                    {busyId === category.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : category.active ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    {category.active ? "Hide" : "Show"}
                  </Button>
                  {category.active && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/students?category=${category.id}`}>
                        View
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="px-5 py-10 text-center text-[12px] text-slate-muted">
                No categories yet. Create the first one on the right.
              </li>
            )}
          </ul>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
                <FolderPlus className="size-4" />
              </span>
              <div>
                <h2 className="text-[13.5px] font-bold text-navy">New category</h2>
                <p className="text-[10.5px] text-slate-muted">
                  It appears on the site immediately.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-1 block text-[11.5px] font-semibold text-ink"
                >
                  Name
                </label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Nursing Scholarship"
                  maxLength={60}
                />
              </div>
              <div>
                <label
                  htmlFor="category-description"
                  className="mb-1 block text-[11.5px] font-semibold text-ink"
                >
                  Description
                </label>
                <Textarea
                  id="category-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="A short sentence shown in filters and admin screens."
                  maxLength={300}
                />
              </div>
              <Button
                className="w-full"
                onClick={create}
                disabled={creating || name.trim().length < 3}
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FolderPlus className="size-4" />
                )}
                {creating ? "Creating…" : "Create category"}
              </Button>
            </div>
          </section>

          <div className="rounded-xl border border-dashed border-border bg-white px-4 py-3 text-[10.5px] leading-relaxed text-slate-muted">
            To move a student into a new category, edit that student and pick the
            category from the dropdown. A hidden category hides all of its students
            everywhere on the public site.
          </div>
        </aside>
      </div>
    </div>
  );
}
