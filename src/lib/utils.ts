import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import type {
  CampaignStatus,
  Donation,
  DonationStatus,
  DonationType,
  FundingSummary,
  PaymentMethodId,
  Student,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------ Currency ------------------------------ */

// USD-first helpers live in currency.ts; re-exported here so components keep a
// single utility import.
export {
  formatMoney,
  formatCompactMoney,
  formatUSD,
  toUsd,
  toBdt,
  USD_TO_BDT,
  MONTHLY_TIERS,
  MIN_ONE_TIME_BDT,
} from "@/lib/currency";

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value));
}

export function formatBDT(amount: number, withSymbol = true) {
  const value = numberFormatter.format(Math.round(amount));
  return withSymbol ? `৳ ${value}` : value;
}

export function formatCompactBDT(amount: number) {
  if (amount >= 1_000_000) {
    return `৳ ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1_000) {
    return `৳ ${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `৳ ${numberFormatter.format(amount)}`;
}

/* -------------------------------- Dates ------------------------------- */

export function toDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : new Date();
}

export function formatDate(value: string | Date, pattern = "d MMM yyyy") {
  return format(toDate(value), pattern);
}

export function formatDateTime(value: string | Date) {
  return format(toDate(value), "d MMM yyyy, h:mm a");
}

export function formatMonthYear(value: string | Date) {
  return format(toDate(value), "MMM yyyy");
}

export function timeAgo(value: string | Date) {
  return formatDistanceToNow(toDate(value), { addSuffix: true });
}

/* ------------------------------- Funding ------------------------------ */

/** Funding summary for a student, derived only from approved donations. */
export function getFunding(
  student: Pick<Student, "id" | "requiredAmount">,
  donations: Donation[],
): FundingSummary {
  const approved = donations.filter(
    (donation) =>
      donation.studentId === student.id && donation.status === "approved",
  );
  const raised = approved.reduce((total, donation) => total + donation.amount, 0);
  const required = student.requiredAmount;
  return {
    required,
    raised,
    remaining: Math.max(0, required - raised),
    percent:
      required > 0 ? Math.min(100, Math.round((raised / required) * 100)) : 0,
    approvedDonationCount: approved.length,
    supporterCount: new Set(approved.map((donation) => donation.donorId)).size,
  };
}

/* ------------------------------ Identity ------------------------------ */

export function getInitials(name: string) {
  const cleaned = name
    .replace(/^(md\.?|mst\.?|mrs\.?|mr\.?)\s+/i, "")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "EF";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const avatarPalettes = [
  ["#0f7a54", "#138b60", "#7ed0b0"],
  ["#1c3f5f", "#102a43", "#7fa6c9"],
  ["#8a5a12", "#b47a1e", "#f2c879"],
  ["#6b3f8f", "#8b5cb3", "#d5bde9"],
  ["#0d6b6b", "#138b8b", "#7fd1d1"],
  ["#8f3d4a", "#b85564", "#efb3bd"],
  ["#3f5d2a", "#5c823c", "#b5d59a"],
  ["#7a4b2a", "#9c6238", "#e2b995"],
] as const;

export function avatarPalette(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  const palette = avatarPalettes[hash % avatarPalettes.length];
  return {
    backgroundImage: `linear-gradient(135deg, ${palette[1]} 0%, ${palette[0]} 100%)`,
    accent: palette[2],
  };
}

/* ------------------------------- Labels ------------------------------- */

export const donationTypeLabels: Record<DonationType, string> = {
  "one-time": "One-time donation",
  monthly: "Monthly sponsorship",
  yearly: "Yearly sponsorship",
  "full-scholarship": "Full scholarship",
};

export const donationStatusLabels: Record<DonationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const paymentMethodLabels: Record<PaymentMethodId, string> = {
  "bank-transfer": "Bank transfer",
  bkash: "bKash",
  nagad: "Nagad",
  card: "Card / international transfer",
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  active: "Active campaign",
  "fully-funded": "Fully funded",
  completed: "Completed",
  paused: "Paused",
  draft: "Draft",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(value: string, length = 120) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

let idCounter = 0;
export function generateId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}${idCounter.toString(36)}`;
}

export function uniqueTransactionId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TRX-${Date.now().toString().slice(-6)}-${random}`;
}

export function publicDonorName(name: string, showNamePublicly: boolean) {
  return showNamePublicly ? name : "Anonymous Supporter";
}
