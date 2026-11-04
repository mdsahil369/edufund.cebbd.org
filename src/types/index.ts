export type ID = string;

/* ----------------------------- Education ----------------------------- */

export interface EducationCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  active: boolean;
}

export type CampaignStatus =
  | "active"
  | "fully-funded"
  | "completed"
  | "paused"
  | "draft";

export type StudentVisibility = "published" | "unpublished";

/** Student shape safe for public pages and client components. */
export type PublicStudent = Omit<Student, "privateInfo">;

export interface StudentSupportPlans {
  /** Admin controlled preset amounts for one-time contributions */
  oneTimeOptions: number[];
  /** Admin controlled recurring amount (BDT) */
  monthly: number;
  /** Admin controlled recurring amount (BDT) */
  yearly: number;
  /** Admin controlled full scholarship amount (BDT) */
  fullScholarship: number;
}

export interface StudentStory {
  family: string;
  challenges: string;
  ambitions: string;
  financialNeeds: string;
  dreams: string;
}

/** Never rendered on public pages. */
export interface StudentPrivateInfo {
  dateOfBirth?: string;
  mobile: string;
  fatherName: string;
  motherName: string;
  address: string;
  guardianOccupation?: string;
  familyIncome?: number;
  adminNotes?: string;
}

export interface Student {
  id: ID;
  slug: string;
  fullName: string;
  photoUrl?: string;
  gender?: "male" | "female" | "other";
  district: string;
  division: string;
  categoryId: ID;
  institution: string;
  headline: string;
  shortBio: string;
  story: StudentStory;
  previousExam: string;
  passingYear: number;
  result: string;
  futureGoal: string;
  requiredAmount: number;
  campaignStatus: CampaignStatus;
  visibility: StudentVisibility;
  featured: boolean;
  createdAt: string;
  supportPlans: StudentSupportPlans;
  privateInfo: StudentPrivateInfo;
}

/* ------------------------------- Donors ------------------------------- */

export type DonorStatus = "active" | "suspended";

export interface Donor {
  id: ID;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  joinedAt: string;
  updatedAt?: string;
  status: DonorStatus;
  /** Hidden by default — public displays use "Anonymous Supporter" when false. */
  showNamePublicly: boolean;
  address?: string;
  bio?: string;
  /** Admin-only internal note. Never rendered on donor or public pages. */
  adminNotes?: string;
}

export interface Session {
  role: "donor" | "admin";
  donorId?: ID;
  name: string;
  email: string;
}

/* ------------------------------ Donations ----------------------------- */

export type DonationType = "one-time" | "monthly" | "yearly" | "full-scholarship";
export type DonationStatus = "pending" | "approved" | "rejected";
export type PaymentMethodId = "bank-transfer" | "bkash" | "nagad";

export interface Donation {
  id: ID;
  receiptNumber: string;
  donorId: ID;
  studentId: ID;
  type: DonationType;
  amount: number;
  method: PaymentMethodId;
  transactionId: string;
  senderReference: string;
  paymentDate: string;
  message?: string;
  status: DonationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface FundingSummary {
  required: number;
  raised: number;
  remaining: number;
  percent: number;
  approvedDonationCount: number;
  supporterCount: number;
}

/** Verified totals per student, read from `public.student_funding_summary`. */
export interface FundingTotals {
  raised: number;
  approvedDonationCount: number;
  supporterCount: number;
}

/** A verified donation as exposed on public pages (donor name already masked). */
export interface PublicSupporter {
  id: ID;
  studentId: ID;
  name: string;
  amount: number;
  type: DonationType;
  paymentDate: string;
  submittedAt: string;
  anonymous: boolean;
}

/* ------------------------------ Messaging ----------------------------- */

export type MessageAuthorRole = "donor" | "admin" | "student";
export type ConversationStatus = "open" | "closed";

export interface Conversation {
  id: ID;
  donorId: ID;
  studentId: ID;
  subject: string;
  createdAt: string;
  updatedAt: string;
  unreadForDonor: number;
  unreadForAdmin: number;
  status: ConversationStatus;
}

export interface Message {
  id: ID;
  conversationId: ID;
  authorRole: MessageAuthorRole;
  authorName: string;
  body: string;
  createdAt: string;
  readByDonor: boolean;
  readByAdmin: boolean;
}

/* ---------------------------- Content / Site -------------------------- */

export interface Achievement {
  id: ID;
  title: string;
  description: string;
  date: string;
  image: string;
  category: string;
  metric?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  routingNumber: string;
}

export interface MobileWalletDetails {
  number: string;
  accountType: string;
}

export interface PaymentSettings {
  bank: BankDetails;
  bkash: MobileWalletDetails;
  nagad: MobileWalletDetails;
  instructions: string[];
  verificationNote: string;
  supportEmail: string;
  supportPhone: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  organization: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcement: string;
  announcementHref: string;
  socials: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  donationNote: string;
}

export interface ImpactStats {
  studentsSupported: number;
  fundsRaised: number;
  activeCampaigns: number;
  communitySupporters: number;
}

/* ------------------------------ Queries ------------------------------- */

export type StudentSort =
  | "newest"
  | "most-funded"
  | "most-needed"
  | "name-asc";

export interface StudentQuery {
  search?: string;
  categoryId?: string;
  district?: string;
  status?: CampaignStatus | "all";
  sort?: StudentSort;
}

export interface DonationInput {
  donorId: ID;
  studentId: ID;
  type: DonationType;
  amount: number;
  method: PaymentMethodId;
  transactionId: string;
  senderReference: string;
  paymentDate: string;
  message?: string;
}
