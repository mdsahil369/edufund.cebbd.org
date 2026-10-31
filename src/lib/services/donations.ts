import { donations } from "@/lib/mock-data/donations";
import { donors } from "@/lib/mock-data/donors";
import type { Donation, DonationStatus } from "@/types";

export async function getDonationsByDonor(donorId: string): Promise<Donation[]> {
  return donations
    .filter((donation) => donation.donorId === donorId)
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
}

export async function getDonationsByStudent(
  studentId: string,
): Promise<Donation[]> {
  return donations.filter((donation) => donation.studentId === studentId);
}

export async function getDonationsByStatus(
  status: DonationStatus,
): Promise<Donation[]> {
  return donations.filter((donation) => donation.status === status);
}

export async function getApprovedDonations(): Promise<Donation[]> {
  return donations.filter((donation) => donation.status === "approved");
}

export async function getDonationStats() {
  const approved = donations.filter((donation) => donation.status === "approved");
  const pending = donations.filter((donation) => donation.status === "pending");
  const rejected = donations.filter((donation) => donation.status === "rejected");

  return {
    totalApprovedAmount: approved.reduce(
      (total, donation) => total + donation.amount,
      0,
    ),
    approvedCount: approved.length,
    pendingCount: pending.length,
    rejectedCount: rejected.length,
    totalDonors: new Set(donations.map((donation) => donation.donorId)).size,
    registeredDonors: donors.length,
  };
}
