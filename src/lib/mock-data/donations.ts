import type {
  Donation,
  DonationStatus,
  DonationType,
  PaymentMethodId,
} from "@/types";

/**
 * Sample funding targets per student id.
 *
 * These amounts only exist to make the demo donation history look realistic
 * while donations are still stored locally. Student records themselves live in
 * Supabase.
 */
const fundingSeeds: { id: string; raised: number }[] = [
  { id: "stu-01", raised: 52000 },
  { id: "stu-02", raised: 31000 },
  { id: "stu-03", raised: 74000 },
  { id: "stu-04", raised: 20500 },
  { id: "stu-05", raised: 41000 },
  { id: "stu-06", raised: 76000 },
  { id: "stu-07", raised: 22000 },
  { id: "stu-08", raised: 49000 },
  { id: "stu-09", raised: 18000 },
  { id: "stu-10", raised: 66000 },
  { id: "stu-11", raised: 33000 },
  { id: "stu-12", raised: 12000 },
  { id: "stu-13", raised: 58000 },
  { id: "stu-14", raised: 27000 },
  { id: "stu-15", raised: 44000 },
  { id: "stu-16", raised: 9000 },
  { id: "stu-17", raised: 68000 },
  { id: "stu-18", raised: 46000 },
  { id: "stu-19", raised: 15000 },
  { id: "stu-20", raised: 82000 },
  { id: "stu-21", raised: 0 },
];

const donorsCycle = [
  "donor-02",
  "donor-03",
  "donor-04",
  "donor-05",
  "donor-06",
  "donor-07",
  "donor-08",
];

const methods: PaymentMethodId[] = ["bkash", "bank-transfer", "nagad"];

const anchors = [
  "2026-05-14",
  "2026-06-09",
  "2026-07-18",
  "2026-08-06",
  "2026-09-21",
  "2026-10-15",
];

function at(date: string, hour: number, minute: number) {
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`;
}

function buildApprovedDonations(): Donation[] {
  const generated: Donation[] = [];
  let receipt = 1041;

  fundingSeeds.forEach((student, index) => {
    const target = student.raised;
    if (target <= 0) return;

    const first = Math.round((target * 0.45) / 500) * 500;
    const second = Math.round((target * 0.3) / 500) * 500;
    const third = target - first - second;
    const amounts = third > 0 ? [first, second, third] : [first, target - first];

    amounts.forEach((amount, part) => {
      if (amount <= 0) return;
      const anchor = anchors[(index + part * 2) % anchors.length];
      const demoDonor = index % 3 === 0 && part === 0;
      const donorId = demoDonor
        ? "donor-01"
        : donorsCycle[(index + part) % donorsCycle.length];
      const type: DonationType =
        demoDonor && (student.id === "stu-05" || student.id === "stu-13")
          ? "monthly"
          : part === 0 && index % 5 === 0
            ? "yearly"
            : "one-time";

      generated.push({
        id: `don-${100 + generated.length}`,
        receiptNumber: `EF-2026-${receipt++}`,
        donorId,
        studentId: student.id,
        type,
        amount,
        method: methods[(index + part) % methods.length],
        transactionId: `TRX-${2026}${String(index + 1).padStart(2, "0")}${part}${String(480 + index).slice(-3)}`,
        senderReference: `**** ${String(1200 + index * 7 + part * 3).slice(-4)}`,
        paymentDate: anchor,
        status: "approved",
        submittedAt: at(anchor, 10 + part, 12 + (index % 40)),
        reviewedAt: at(anchor, 15 + part, 20 + (index % 30)),
        message:
          part === 0
            ? "Wishing you every success in your studies. Keep going."
            : undefined,
      });
    });
  });

  return generated;
}

const pendingDonations: Donation[] = [
  {
    id: "don-901",
    receiptNumber: "EF-2026-2901",
    donorId: "donor-01",
    studentId: "stu-02",
    type: "one-time",
    amount: 5000,
    method: "bkash",
    transactionId: "TRX-9F2K71",
    senderReference: "01700-000201",
    paymentDate: "2026-10-28",
    message: "Please let me know if this reaches Rakib's semester fund.",
    status: "pending",
    submittedAt: "2026-10-28T09:42:00.000Z",
  },
  {
    id: "don-902",
    receiptNumber: "EF-2026-2902",
    donorId: "donor-03",
    studentId: "stu-01",
    type: "one-time",
    amount: 10000,
    method: "bank-transfer",
    transactionId: "TRX-BANK-88214",
    senderReference: "AC **** 4412",
    paymentDate: "2026-10-27",
    status: "pending",
    submittedAt: "2026-10-27T14:18:00.000Z",
  },
  {
    id: "don-903",
    receiptNumber: "EF-2026-2903",
    donorId: "donor-05",
    studentId: "stu-13",
    type: "monthly",
    amount: 2500,
    method: "nagad",
    transactionId: "TRX-NG-55031",
    senderReference: "01811-000205",
    paymentDate: "2026-10-26",
    message: "For Tania's clinical training costs.",
    status: "pending",
    submittedAt: "2026-10-26T11:05:00.000Z",
  },
  {
    id: "don-904",
    receiptNumber: "EF-2026-2904",
    donorId: "donor-02",
    studentId: "stu-18",
    type: "one-time",
    amount: 5000,
    method: "bkash",
    transactionId: "TRX-ADM-7782",
    senderReference: "01700-000202",
    paymentDate: "2026-10-25",
    status: "pending",
    submittedAt: "2026-10-25T16:30:00.000Z",
  },
  {
    id: "don-905",
    receiptNumber: "EF-2026-2905",
    donorId: "donor-01",
    studentId: "stu-20",
    type: "yearly",
    amount: 15000,
    method: "bank-transfer",
    transactionId: "TRX-BANK-99120",
    senderReference: "AC **** 7781",
    paymentDate: "2026-10-24",
    message: "Toward Jannatul's final-year research costs.",
    status: "pending",
    submittedAt: "2026-10-24T10:12:00.000Z",
  },
  {
    id: "don-906",
    receiptNumber: "EF-2026-2906",
    donorId: "donor-07",
    studentId: "stu-09",
    type: "one-time",
    amount: 2500,
    method: "nagad",
    transactionId: "TRX-NG-61209",
    senderReference: "01811-000207",
    paymentDate: "2026-10-23",
    status: "pending",
    submittedAt: "2026-10-23T19:44:00.000Z",
  },
];

const rejectedDonations: Donation[] = [
  {
    id: "don-910",
    receiptNumber: "EF-2026-2910",
    donorId: "donor-04",
    studentId: "stu-05",
    type: "one-time",
    amount: 1000,
    method: "bkash",
    transactionId: "TRX-UNVERIFIED-01",
    senderReference: "01700-000204",
    paymentDate: "2026-10-12",
    status: "rejected",
    submittedAt: "2026-10-12T08:20:00.000Z",
    reviewedAt: "2026-10-13T10:05:00.000Z",
    reviewNote:
      "Transaction ID could not be matched with the bKash statement. Please resubmit with the correct ID.",
  },
  {
    id: "don-911",
    receiptNumber: "EF-2026-2911",
    donorId: "donor-06",
    studentId: "stu-08",
    type: "one-time",
    amount: 5000,
    method: "bank-transfer",
    transactionId: "TRX-DUPLICATE-22",
    senderReference: "AC **** 3389",
    paymentDate: "2026-10-05",
    status: "rejected",
    submittedAt: "2026-10-05T13:10:00.000Z",
    reviewedAt: "2026-10-06T09:15:00.000Z",
    reviewNote:
      "This transaction ID was already used for an earlier donation. Duplicate submissions are not accepted.",
  },
];

export const donations: Donation[] = [
  ...buildApprovedDonations(),
  ...pendingDonations,
  ...rejectedDonations,
];

export function donationsForStudent(studentId: string, status?: DonationStatus) {
  return donations.filter(
    (donation) =>
      donation.studentId === studentId &&
      (status ? donation.status === status : true),
  );
}
