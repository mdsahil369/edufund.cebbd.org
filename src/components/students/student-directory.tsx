"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { StudentCard } from "@/components/students/student-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CampaignStatus,
  EducationCategory,
  FundingSummary,
  PublicStudent,
  StudentSort,
} from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

interface StudentDirectoryProps {
  students: PublicStudent[];
  categories: EducationCategory[];
  districts: string[];
  fundingById: Record<string, FundingSummary>;
}

export function StudentDirectory({
  students,
  categories,
  districts,
  fundingById,
}: StudentDirectoryProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [category, setCategory] = useState("all");
  const [district, setDistrict] = useState("all");
  const [status, setStatus] = useState<CampaignStatus | "all">("all");
  const [sort, setSort] = useState<StudentSort>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [deferredSearch, category, district, status, sort]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: students.length };
    for (const student of students) {
      counts[student.categoryId] = (counts[student.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [students]);

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    let result = students.filter((student) => {
      if (category !== "all" && student.categoryId !== category) return false;
      if (district !== "all" && student.district !== district) return false;
      if (status !== "all" && student.campaignStatus !== status) return false;
      if (query) {
        const haystack = [
          student.fullName,
          student.institution,
          student.district,
          student.headline,
          student.shortBio,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "most-funded":
          return (fundingById[b.id]?.percent ?? 0) - (fundingById[a.id]?.percent ?? 0);
        case "most-needed":
          return (fundingById[b.id]?.remaining ?? 0) - (fundingById[a.id]?.remaining ?? 0);
        case "name-asc":
          return a.fullName.localeCompare(b.fullName);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [students, deferredSearch, category, district, status, sort, fundingById]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visible.length < filtered.length;
  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    district !== "all" ||
    status !== "all" ||
    sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setDistrict("all");
    setStatus("all");
    setSort("newest");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
            category === "all"
              ? "border-brand bg-brand text-white"
              : "border-border bg-white text-ink hover:border-brand/30 hover:text-brand-dark",
          )}
        >
          All students
          <span
            className={cn(
              "rounded-full px-1.5 text-[10px]",
              category === "all" ? "bg-white/20" : "bg-muted text-slate-muted",
            )}
          >
            {categoryCounts.all}
          </span>
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
              category === item.id
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-ink hover:border-brand/30 hover:text-brand-dark",
            )}
          >
            {item.name}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px]",
                category === item.id ? "bg-white/20" : "bg-muted text-slate-muted",
              )}
            >
              {categoryCounts[item.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-white p-4 shadow-[0_1px_2px_rgba(16,42,67,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, institution, or district…"
              aria-label="Search students"
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-muted transition-colors hover:bg-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 w-full lg:w-[170px]" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-10 w-full lg:w-[150px]" aria-label="Filter by district">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {districts.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as CampaignStatus | "all")}
            >
              <SelectTrigger className="h-10 w-full lg:w-[150px]" aria-label="Filter by campaign status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="fully-funded">Fully funded</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => setSort(value as StudentSort)}
            >
              <SelectTrigger className="h-10 w-full lg:w-[165px]" aria-label="Sort students">
                <SlidersHorizontal className="size-3.5 text-slate-muted" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="most-funded">Most funded</SelectItem>
                <SelectItem value="most-needed">Most needed</SelectItem>
                <SelectItem value="name-asc">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 shrink-0 text-slate-muted"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-slate-muted">
          Showing{" "}
          <span className="font-semibold text-ink">{visible.length}</span> of{" "}
          <span className="font-semibold text-ink">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "student" : "students"}
          {hasActiveFilters && " matching your filters"}
        </p>
        <p className="flex items-center gap-1.5 text-[11.5px] text-slate-muted">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Only published, verified profiles are shown
        </p>
      </div>

      {visible.length > 0 ? (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                funding={
                  fundingById[student.id] ?? {
                    required: student.requiredAmount,
                    raised: 0,
                    remaining: student.requiredAmount,
                    percent: 0,
                    approvedDonationCount: 0,
                    supporterCount: 0,
                  }
                }
              />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-2">
            {hasMore ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Load more students
                  <ChevronDown className="size-4" />
                </Button>
                <p className="text-[11px] text-slate-muted">
                  {filtered.length - visible.length} more to view
                </p>
              </>
            ) : (
              <p className="text-[12px] text-slate-muted">
                You have reached the end of the archive.
              </p>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="No students match your filters"
          description="Try a different category, district, or search term. New student applications are added regularly."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          }
          className="mt-6"
        />
      )}
    </div>
  );
}
