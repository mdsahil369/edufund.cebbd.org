"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  GraduationCap,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { StudentAvatar } from "@/components/students/student-avatar";
import { StatusPill, campaignStatusTone } from "@/components/shared/status-pill";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/lib/store/demo-store";
import { educationCategories, getCategoryName } from "@/lib/mock-data/categories";
import type { CampaignStatus, Student } from "@/types";
import {
  campaignStatusLabels,
  cn,
  formatBDT,
  generateId,
  slugify,
} from "@/lib/utils";

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const campaignStatuses: CampaignStatus[] = [
  "active",
  "fully-funded",
  "completed",
  "paused",
  "draft",
];

const studentSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the student's full name."),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a URL slug.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only.",
    ),
  gender: z.enum(["male", "female", "other"]).optional(),
  categoryId: z.string().min(1, "Choose a category."),
  district: z.string().trim().min(1, "Enter a district."),
  division: z.string().min(1, "Choose a division."),
  institution: z.string().trim().min(2, "Enter the institution."),
  headline: z.string().trim().min(5, "Add a short headline.").max(120),
  shortBio: z.string().trim().min(20, "Add a short bio (20+ characters).").max(240),
  storyFamily: z.string().trim().min(10, "Add the family background."),
  storyChallenges: z.string().trim().min(10, "Add the challenges."),
  storyAmbitions: z.string().trim().min(10, "Add the ambitions."),
  storyFinancialNeeds: z.string().trim().min(10, "Add the financial needs."),
  storyDreams: z.string().trim().min(10, "Add the dreams."),
  previousExam: z.string().trim().min(2, "Enter the previous exam."),
  passingYear: z
    .number({ message: "Enter a passing year." })
    .min(1990, "Enter a valid year.")
    .max(2030, "Enter a valid year."),
  result: z.string().trim().min(1, "Enter the result."),
  futureGoal: z.string().trim().min(5, "Add the future goal."),
  requiredAmount: z
    .number({ message: "Enter the required amount." })
    .min(1000, "Minimum is ৳1,000."),
  campaignStatus: z.enum(["active", "fully-funded", "completed", "paused", "draft"]),
  visibility: z.enum(["published", "unpublished"]),
  featured: z.boolean(),
  mobile: z
    .string()
    .trim()
    .min(6, "Enter the student's mobile number.")
    .max(20),
  fatherName: z.string().trim().min(2, "Enter the father's name."),
  motherName: z.string().trim().min(2, "Enter the mother's name."),
  address: z.string().trim().min(5, "Enter the private address."),
  guardianOccupation: z.string().trim().optional(),
  familyIncome: z.string().trim().optional(),
  adminNotes: z.string().trim().optional(),
  oneTimeOptions: z
    .string()
    .trim()
    .min(1, "Add at least one one-time amount.")
    .refine(
      (value) =>
        value
          .split(",")
          .map((item) => Number(item.trim()))
          .every((amount) => Number.isFinite(amount) && amount >= 100),
      "Use comma-separated amounts of ৳100 or more.",
    ),
  monthly: z.number({ message: "Enter a monthly amount." }).min(100),
  yearly: z.number({ message: "Enter a yearly amount." }).min(100),
  fullScholarship: z
    .number({ message: "Enter the full scholarship amount." })
    .min(100),
});

type StudentFormValues = z.infer<typeof studentSchema>;

function studentToForm(student: Student): StudentFormValues {
  return {
    fullName: student.fullName,
    slug: student.slug,
    gender: student.gender,
    categoryId: student.categoryId,
    district: student.district,
    division: student.division,
    institution: student.institution,
    headline: student.headline,
    shortBio: student.shortBio,
    storyFamily: student.story.family,
    storyChallenges: student.story.challenges,
    storyAmbitions: student.story.ambitions,
    storyFinancialNeeds: student.story.financialNeeds,
    storyDreams: student.story.dreams,
    previousExam: student.previousExam,
    passingYear: student.passingYear,
    result: student.result,
    futureGoal: student.futureGoal,
    requiredAmount: student.requiredAmount,
    campaignStatus: student.campaignStatus,
    visibility: student.visibility,
    featured: student.featured,
    mobile: student.privateInfo.mobile,
    fatherName: student.privateInfo.fatherName,
    motherName: student.privateInfo.motherName,
    address: student.privateInfo.address,
    guardianOccupation: student.privateInfo.guardianOccupation ?? "",
    familyIncome: student.privateInfo.familyIncome
      ? String(student.privateInfo.familyIncome)
      : "",
    adminNotes: student.privateInfo.adminNotes ?? "",
    oneTimeOptions: student.supportPlans.oneTimeOptions.join(", "),
    monthly: student.supportPlans.monthly,
    yearly: student.supportPlans.yearly,
    fullScholarship: student.supportPlans.fullScholarship,
  };
}

const emptyForm: StudentFormValues = {
  fullName: "",
  slug: "",
  gender: undefined,
  categoryId: "cat-diploma",
  district: "",
  division: "Dhaka",
  institution: "",
  headline: "",
  shortBio: "",
  storyFamily: "",
  storyChallenges: "",
  storyAmbitions: "",
  storyFinancialNeeds: "",
  storyDreams: "",
  previousExam: "",
  passingYear: 2026,
  result: "",
  futureGoal: "",
  requiredAmount: 25000,
  campaignStatus: "active",
  visibility: "unpublished",
  featured: false,
  mobile: "",
  fatherName: "",
  motherName: "",
  address: "",
  guardianOccupation: "",
  familyIncome: "",
  adminNotes: "",
  oneTimeOptions: "1000, 2500, 5000, 10000",
  monthly: 1500,
  yearly: 15000,
  fullScholarship: 25000,
};

export function AdminStudents() {
  const {
    hydrated,
    students,
    donations,
    fundingFor,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentVisibility,
    updateCampaignStatus,
  } = useDemoData();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (category !== "all" && student.categoryId !== category) return false;
      if (visibility !== "all" && student.visibility !== visibility) return false;
      if (status !== "all" && student.campaignStatus !== status) return false;
      if (!query) return true;
      return [
        student.fullName,
        student.institution,
        student.district,
        student.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [students, search, category, visibility, status]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
        <div className="h-[520px] animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const published = students.filter(
    (student) => student.visibility === "published",
  ).length;

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Create and manage student campaigns. Private contact details are stored for admin use only and never appear on public pages."
        action={
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Add student
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total students",
            value: students.length,
            hint: `${published} published`,
            icon: GraduationCap,
          },
          {
            label: "Active campaigns",
            value: students.filter(
              (student) => student.campaignStatus === "active",
            ).length,
            hint: "Accepting donations",
            icon: CheckCircle2,
          },
          {
            label: "Drafts / paused",
            value: students.filter(
              (student) =>
                student.campaignStatus === "draft" ||
                student.campaignStatus === "paused",
            ).length,
            hint: "Not actively fundraising",
            icon: EyeOff,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
              <item.icon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] text-slate-muted">{item.label}</p>
              <p className="text-lg font-extrabold text-navy">{item.value}</p>
              <p className="text-[10px] text-slate-muted">{item.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative xl:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, institution, district…"
              aria-label="Search students"
              className="h-9 pl-9 text-[12.5px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-[12px]" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {educationCategories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="h-9 text-[12px]" aria-label="Filter by visibility">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-[12px]" aria-label="Filter by campaign status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {campaignStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {campaignStatusLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={GraduationCap}
              title="No students match this view"
              description="Adjust your filters or add a new student campaign."
              action={
                <Button size="sm" onClick={openAdd}>
                  <Plus className="size-3.5" />
                  Add student
                </Button>
              }
              className="border-0 bg-surface"
            />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <div className="grid grid-cols-[2fr_1.1fr_1.2fr_1fr_1.3fr_48px] gap-3 border-b border-border bg-surface px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-muted">
                <span>Student</span>
                <span>Category</span>
                <span>Campaign</span>
                <span>Visibility</span>
                <span>Funding</span>
                <span className="sr-only">Actions</span>
              </div>
              <ul className="divide-y divide-border">
                {filtered.map((student) => {
                  const funding = fundingFor(student.id);
                  return (
                    <li
                      key={student.id}
                      className="grid grid-cols-[2fr_1.1fr_1.2fr_1fr_1.3fr_48px] items-center gap-3 px-5 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <StudentAvatar
                          name={student.fullName}
                          photoUrl={student.photoUrl}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold text-ink">
                            {student.fullName}
                          </p>
                          <p className="truncate text-[10.5px] text-slate-muted">
                            {student.institution} · {student.district}
                          </p>
                        </div>
                      </div>
                      <span className="truncate text-[11px] text-slate-muted">
                        {getCategoryName(student.categoryId)}
                      </span>
                      <Select
                        value={student.campaignStatus}
                        onValueChange={(value) => {
                          updateCampaignStatus(student.id, value as CampaignStatus);
                          toast.success("Campaign status updated.");
                        }}
                      >
                        <SelectTrigger
                          className="h-7 w-fit gap-1 border-0 bg-transparent px-0 text-[11px] font-semibold shadow-none focus:ring-0"
                          aria-label={`Campaign status for ${student.fullName}`}
                        >
                          <StatusPill
                            tone={campaignStatusTone(student.campaignStatus)}
                            className="py-0.5 text-[10px]"
                          >
                            {campaignStatusLabels[student.campaignStatus]}
                          </StatusPill>
                        </SelectTrigger>
                        <SelectContent>
                          {campaignStatuses.map((item) => (
                            <SelectItem key={item} value={item}>
                              {campaignStatusLabels[item]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div>
                        <StatusPill
                          tone={
                            student.visibility === "published" ? "success" : "neutral"
                          }
                          className="py-0.5 text-[10px]"
                        >
                          {student.visibility === "published" ? "Published" : "Hidden"}
                        </StatusPill>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-ink">
                            {formatBDT(funding.raised)}
                          </span>
                          <span className="text-slate-muted">{funding.percent}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${funding.percent}%` }}
                          />
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${student.fullName}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openEdit(student)}>
                            <Pencil className="size-4" />
                            Edit student
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/students/${student.slug}`}>
                              <ExternalLink className="size-4" />
                              View public page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toggleStudentVisibility(student.id);
                              toast.success(
                                student.visibility === "published"
                                  ? "Student unpublished."
                                  : "Student published.",
                              );
                            }}
                          >
                            {student.visibility === "published" ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                            {student.visibility === "published"
                              ? "Unpublish"
                              : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(student)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="divide-y divide-border lg:hidden">
              {filtered.map((student) => {
                const funding = fundingFor(student.id);
                return (
                  <li key={student.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <StudentAvatar
                        name={student.fullName}
                        photoUrl={student.photoUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">
                          {student.fullName}
                        </p>
                        <p className="truncate text-[10.5px] text-slate-muted">
                          {getCategoryName(student.categoryId)} · {student.district}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${student.fullName}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openEdit(student)}>
                            <Pencil className="size-4" />
                            Edit student
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/students/${student.slug}`}>
                              <ExternalLink className="size-4" />
                              View public page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toggleStudentVisibility(student.id);
                              toast.success(
                                student.visibility === "published"
                                  ? "Student unpublished."
                                  : "Student published.",
                              );
                            }}
                          >
                            {student.visibility === "published" ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                            {student.visibility === "published"
                              ? "Unpublish"
                              : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(student)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusPill
                        tone={campaignStatusTone(student.campaignStatus)}
                        className="py-0.5 text-[10px]"
                      >
                        {campaignStatusLabels[student.campaignStatus]}
                      </StatusPill>
                      <StatusPill
                        tone={
                          student.visibility === "published" ? "success" : "neutral"
                        }
                        className="py-0.5 text-[10px]"
                      >
                        {student.visibility === "published" ? "Published" : "Hidden"}
                      </StatusPill>
                      <span className="ml-auto text-[10.5px] text-slate-muted">
                        {formatBDT(funding.raised)} / {formatBDT(funding.required)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${funding.percent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle>{editing ? "Edit student" : "Add student"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the campaign, story, support plans, and private records."
                : "Create a new student campaign. It stays unpublished until you publish it."}
            </DialogDescription>
          </DialogHeader>
          {formOpen && (
            <StudentForm
              key={editing?.id ?? "new"}
              student={editing}
              students={students}
              donationCount={
                editing
                  ? donations.filter(
                      (donation) => donation.studentId === editing.id,
                    ).length
                  : 0
              }
              onCancel={() => setFormOpen(false)}
              onSave={(values, photoUrl) => {
                if (editing) {
                  updateStudent(editing.id, {
                    ...values,
                    photoUrl,
                  });
                  toast.success("Student updated.");
                } else {
                  addStudent({
                    ...values,
                    id: generateId("stu"),
                    photoUrl,
                    createdAt: new Date().toISOString(),
                  });
                  toast.success("Student created. Publish it when ready.");
                }
                setFormOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete student?</DialogTitle>
            <DialogDescription>
              This removes {deleting?.fullName ?? "this student"} from the current data
              database. Existing donation records are kept but will no longer show
              the student name.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            This action cannot be undone in the current session.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleting) return;
                deleteStudent(deleting.id);
                toast.success("Student deleted.");
                setDeleting(null);
              }}
            >
              <Trash2 className="size-4" />
              Delete student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StudentFormProps {
  student: Student | null;
  students: Student[];
  donationCount: number;
  onCancel: () => void;
  onSave: (
    values: Omit<Student, "id" | "createdAt" | "photoUrl">,
    photoUrl: string | undefined,
  ) => void;
}

function StudentForm({
  student,
  students,
  donationCount,
  onCancel,
  onSave,
}: StudentFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(student?.photoUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: student ? studentToForm(student) : emptyForm,
  });

  const fullName = watch("fullName");
  const featured = watch("featured");

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > 900 * 1024) {
      setPhotoError("Please choose an image smaller than 900 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoError(null);
      setPhotoUrl(typeof reader.result === "string" ? reader.result : undefined);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = handleSubmit((values) => {
    const slugTaken = students.some(
      (item) => item.slug === values.slug && item.id !== student?.id,
    );
    if (slugTaken) {
      setError("slug", { message: "This slug is already in use." });
      return;
    }

    const oneTimeOptions = values.oneTimeOptions
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((amount) => Number.isFinite(amount) && amount > 0);

    const familyIncome = values.familyIncome
      ? Number(values.familyIncome.replace(/[^0-9]/g, ""))
      : undefined;

    onSave(
      {
        fullName: values.fullName,
        slug: values.slug,
        gender: values.gender,
        district: values.district,
        division: values.division,
        categoryId: values.categoryId,
        institution: values.institution,
        headline: values.headline,
        shortBio: values.shortBio,
        story: {
          family: values.storyFamily,
          challenges: values.storyChallenges,
          ambitions: values.storyAmbitions,
          financialNeeds: values.storyFinancialNeeds,
          dreams: values.storyDreams,
        },
        previousExam: values.previousExam,
        passingYear: values.passingYear,
        result: values.result,
        futureGoal: values.futureGoal,
        requiredAmount: values.requiredAmount,
        campaignStatus: values.campaignStatus,
        visibility: values.visibility,
        featured: values.featured,
        supportPlans: {
          oneTimeOptions,
          monthly: values.monthly,
          yearly: values.yearly,
          fullScholarship: values.fullScholarship,
        },
        privateInfo: {
          mobile: values.mobile,
          fatherName: values.fatherName,
          motherName: values.motherName,
          address: values.address,
          guardianOccupation: values.guardianOccupation || undefined,
          familyIncome: Number.isFinite(familyIncome) ? familyIncome : undefined,
          adminNotes: values.adminNotes || undefined,
        },
      },
      photoUrl,
    );
  });

  const fieldError = (key: keyof StudentFormValues) => {
    const message = errors[key]?.message;
    return message ? (
      <p className="mt-1 text-[11px] text-red-600">{String(message)}</p>
    ) : null;
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="space-y-7 px-5 py-5">
        {student && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface px-3 py-2 text-[11px] text-slate-muted">
            <StatusPill
              tone={campaignStatusTone(student.campaignStatus)}
              className="py-0.5 text-[10px]"
            >
              {campaignStatusLabels[student.campaignStatus]}
            </StatusPill>
            <span>
              {donationCount} donation{donationCount === 1 ? "" : "s"} recorded
            </span>
            {student.visibility === "published" && (
              <Link
                href={`/students/${student.slug}`}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-dark"
              >
                View public page
                <ExternalLink className="size-3" />
              </Link>
            )}
          </div>
        )}

        <section>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-brand-dark">
            Photo & identity
          </h3>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <StudentAvatar
                name={fullName || "New Student"}
                photoUrl={photoUrl}
                size="lg"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="size-3" />
                  Upload
                </Button>
                {photoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove photo"
                    onClick={() => setPhotoUrl(undefined)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
              <p className="text-[9.5px] text-slate-muted">Max 900 KB</p>
              {photoError && (
                <p className="max-w-28 text-center text-[9.5px] text-red-600">
                  {photoError}
                </p>
              )}
            </div>

            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Full name
                </label>
                <Input
                  id="fullName"
                  aria-invalid={Boolean(errors.fullName)}
                  {...register("fullName", {
                    onChange: (event) => {
                      if (!student) {
                        setValue("slug", slugify(event.target.value));
                      }
                    },
                  })}
                />
                {fieldError("fullName")}
              </div>
              <div>
                <label htmlFor="slug" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Public URL slug
                </label>
                <Input id="slug" aria-invalid={Boolean(errors.slug)} {...register("slug")} />
                {fieldError("slug")}
              </div>
              <div>
                <label htmlFor="gender" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Gender <span className="font-normal text-slate-muted">(optional)</span>
                </label>
                <Select
                  value={watch("gender") ?? "none"}
                  onValueChange={(value) =>
                    setValue(
                      "gender",
                      value === "none"
                        ? undefined
                        : (value as "male" | "female" | "other"),
                    )
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Not specified" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="categoryId" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Education category
                </label>
                <Select
                  value={watch("categoryId")}
                  onValueChange={(value) => setValue("categoryId", value)}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationCategories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("categoryId")}
              </div>
              <div>
                <label htmlFor="institution" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Institution
                </label>
                <Input
                  id="institution"
                  placeholder="e.g. Dhaka Polytechnic Institute"
                  aria-invalid={Boolean(errors.institution)}
                  {...register("institution")}
                />
                {fieldError("institution")}
              </div>
              <div>
                <label htmlFor="district" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  District
                </label>
                <Input id="district" aria-invalid={Boolean(errors.district)} {...register("district")} />
                {fieldError("district")}
              </div>
              <div>
                <label htmlFor="division" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Division
                </label>
                <Select
                  value={watch("division")}
                  onValueChange={(value) => setValue("division", value)}
                >
                  <SelectTrigger id="division">
                    <SelectValue placeholder="Choose a division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division} value={division}>
                        {division}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("division")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="headline" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Headline
                </label>
                <Input
                  id="headline"
                  placeholder="A short line that summarises the campaign"
                  aria-invalid={Boolean(errors.headline)}
                  {...register("headline")}
                />
                {fieldError("headline")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="shortBio" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Short bio
                </label>
                <Textarea
                  id="shortBio"
                  rows={2}
                  aria-invalid={Boolean(errors.shortBio)}
                  {...register("shortBio")}
                />
                {fieldError("shortBio")}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-brand-dark">
            Education
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="previousExam" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Previous exam
              </label>
              <Input
                id="previousExam"
                placeholder="SSC / HSC / Diploma"
                aria-invalid={Boolean(errors.previousExam)}
                {...register("previousExam")}
              />
              {fieldError("previousExam")}
            </div>
            <div>
              <label htmlFor="passingYear" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Passing year
              </label>
              <Input
                id="passingYear"
                type="number"
                aria-invalid={Boolean(errors.passingYear)}
                {...register("passingYear", { valueAsNumber: true })}
              />
              {fieldError("passingYear")}
            </div>
            <div>
              <label htmlFor="result" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Result
              </label>
              <Input
                id="result"
                placeholder="e.g. GPA 4.72"
                aria-invalid={Boolean(errors.result)}
                {...register("result")}
              />
              {fieldError("result")}
            </div>
            <div>
              <label htmlFor="futureGoal" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Future goal
              </label>
              <Input
                id="futureGoal"
                aria-invalid={Boolean(errors.futureGoal)}
                {...register("futureGoal")}
              />
              {fieldError("futureGoal")}
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-brand-dark">
            Story
          </h3>
          <div className="mt-3 grid gap-3">
            {(
              [
                ["storyFamily", "Family background"],
                ["storyChallenges", "Challenges"],
                ["storyAmbitions", "Ambitions"],
                ["storyFinancialNeeds", "Financial needs"],
                ["storyDreams", "Dreams"],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label htmlFor={field} className="mb-1 block text-[11.5px] font-semibold text-ink">
                  {label}
                </label>
                <Textarea
                  id={field}
                  rows={2}
                  aria-invalid={Boolean(errors[field])}
                  {...register(field)}
                />
                {fieldError(field)}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-brand-dark">
            Funding & support plans
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="requiredAmount" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Required amount (৳)
              </label>
              <Input
                id="requiredAmount"
                type="number"
                aria-invalid={Boolean(errors.requiredAmount)}
                {...register("requiredAmount", { valueAsNumber: true })}
              />
              {fieldError("requiredAmount")}
            </div>
            <div>
              <label htmlFor="oneTimeOptions" className="mb-1 block text-[11.5px] font-semibold text-ink">
                One-time options (comma separated)
              </label>
              <Input
                id="oneTimeOptions"
                placeholder="1000, 2500, 5000"
                aria-invalid={Boolean(errors.oneTimeOptions)}
                {...register("oneTimeOptions")}
              />
              {fieldError("oneTimeOptions")}
            </div>
            <div>
              <label htmlFor="monthly" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Monthly amount (৳)
              </label>
              <Input
                id="monthly"
                type="number"
                aria-invalid={Boolean(errors.monthly)}
                {...register("monthly", { valueAsNumber: true })}
              />
              {fieldError("monthly")}
            </div>
            <div>
              <label htmlFor="yearly" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Yearly amount (৳)
              </label>
              <Input
                id="yearly"
                type="number"
                aria-invalid={Boolean(errors.yearly)}
                {...register("yearly", { valueAsNumber: true })}
              />
              {fieldError("yearly")}
            </div>
            <div>
              <label htmlFor="fullScholarship" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Full scholarship (৳)
              </label>
              <Input
                id="fullScholarship"
                type="number"
                aria-invalid={Boolean(errors.fullScholarship)}
                {...register("fullScholarship", { valueAsNumber: true })}
              />
              {fieldError("fullScholarship")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="campaignStatus" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Campaign status
                </label>
                <Select
                  value={watch("campaignStatus")}
                  onValueChange={(value) =>
                    setValue("campaignStatus", value as CampaignStatus)
                  }
                >
                  <SelectTrigger id="campaignStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignStatuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {campaignStatusLabels[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="visibility" className="mb-1 block text-[11.5px] font-semibold text-ink">
                  Visibility
                </label>
                <Select
                  value={watch("visibility")}
                  onValueChange={(value) =>
                    setValue("visibility", value as "published" | "unpublished")
                  }
                >
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unpublished">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <Checkbox
                id="featured"
                checked={featured}
                onCheckedChange={(checked) => setValue("featured", checked === true)}
              />
              <label htmlFor="featured" className="text-[12px] font-medium text-ink">
                Feature this student on the homepage
              </label>
            </div>
          </div>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-brand-dark">
            Private information
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
              Never public
            </span>
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="mobile" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Mobile number
              </label>
              <Input
                id="mobile"
                type="tel"
                aria-invalid={Boolean(errors.mobile)}
                {...register("mobile")}
              />
              {fieldError("mobile")}
            </div>
            <div>
              <label htmlFor="guardianOccupation" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Guardian occupation
              </label>
              <Input id="guardianOccupation" {...register("guardianOccupation")} />
            </div>
            <div>
              <label htmlFor="fatherName" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Father&apos;s name
              </label>
              <Input
                id="fatherName"
                aria-invalid={Boolean(errors.fatherName)}
                {...register("fatherName")}
              />
              {fieldError("fatherName")}
            </div>
            <div>
              <label htmlFor="motherName" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Mother&apos;s name
              </label>
              <Input
                id="motherName"
                aria-invalid={Boolean(errors.motherName)}
                {...register("motherName")}
              />
              {fieldError("motherName")}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Private address
              </label>
              <Input
                id="address"
                aria-invalid={Boolean(errors.address)}
                {...register("address")}
              />
              {fieldError("address")}
            </div>
            <div>
              <label htmlFor="familyIncome" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Monthly family income (৳)
              </label>
              <Input id="familyIncome" inputMode="numeric" {...register("familyIncome")} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="adminNotes" className="mb-1 block text-[11.5px] font-semibold text-ink">
                Admin notes
              </label>
              <Textarea id="adminNotes" rows={2} {...register("adminNotes")} />
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-muted">
            Private fields are excluded from the public data passed to the site.
            They are visible only in this admin form.
          </p>
        </section>
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-white px-5 py-3.5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {student ? "Save changes" : "Create student"}
        </Button>
      </div>
    </form>
  );
}
