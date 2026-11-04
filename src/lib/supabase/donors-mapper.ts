import type {
  Donation,
  DonationStatus,
  DonationType,
  Donor,
  DonorStatus,
  PaymentMethodId,
} from "@/types";

/**
 * Row shapes for `public.donors` and `public.donations`.
 * Amounts come back as string or number depending on the driver.
 */
export interface DonorRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  bio: string | null;
  avatar_url: string | null;
  show_name_publicly: boolean;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DonationRow {
  id: string;
  receipt_number: string;
  donor_id: string;
  student_id: string;
  type: string;
  amount: number | string;
  method: string;
  transaction_id: string;
  sender_reference: string;
  payment_date: string;
  message: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  review_note: string | null;
}

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDonationType(value: string): DonationType {
  const allowed: DonationType[] = [
    "one-time",
    "monthly",
    "yearly",
    "full-scholarship",
  ];
  return allowed.includes(value as DonationType)
    ? (value as DonationType)
    : "one-time";
}

function toDonationStatus(value: string): DonationStatus {
  const allowed: DonationStatus[] = ["pending", "approved", "rejected"];
  return allowed.includes(value as DonationStatus)
    ? (value as DonationStatus)
    : "pending";
}

function toPaymentMethod(value: string): PaymentMethodId {
  const allowed: PaymentMethodId[] = ["bank-transfer", "bkash", "nagad"];
  return allowed.includes(value as PaymentMethodId)
    ? (value as PaymentMethodId)
    : "bkash";
}

function toDonorStatus(value: string): DonorStatus {
  return value === "suspended" ? "suspended" : "active";
}

export function toDonor(row: DonorRow): Donor {
  return {
    id: row.id,
    fullName: row.full_name?.trim() || "Supporter",
    email: row.email ?? "",
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    joinedAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    status: toDonorStatus(row.status),
    showNamePublicly: Boolean(row.show_name_publicly),
    adminNotes: row.admin_notes ?? undefined,
  };
}

export function toDonation(row: DonationRow): Donation {
  return {
    id: row.id,
    receiptNumber: row.receipt_number,
    donorId: row.donor_id,
    studentId: row.student_id,
    type: toDonationType(row.type),
    amount: toNumber(row.amount),
    method: toPaymentMethod(row.method),
    transactionId: row.transaction_id,
    senderReference: row.sender_reference,
    paymentDate: row.payment_date,
    message: row.message ?? undefined,
    status: toDonationStatus(row.status),
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewNote: row.review_note ?? undefined,
  };
}
