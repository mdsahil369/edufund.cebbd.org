import type { Conversation, Message } from "@/types";

export const conversations: Conversation[] = [
  {
    id: "conv-01",
    donorId: "donor-01",
    studentId: "stu-01",
    subject: "Questions about Ayesha's semester fees",
    createdAt: "2026-10-22T09:12:00.000Z",
    updatedAt: "2026-10-23T10:22:00.000Z",
    unreadForDonor: 1,
    unreadForAdmin: 0,
    status: "open",
  },
  {
    id: "conv-02",
    donorId: "donor-01",
    studentId: "stu-05",
    subject: "Monthly sponsorship for Nusrat",
    createdAt: "2026-10-20T14:03:00.000Z",
    updatedAt: "2026-10-25T16:47:00.000Z",
    unreadForDonor: 0,
    unreadForAdmin: 1,
    status: "open",
  },
  {
    id: "conv-03",
    donorId: "donor-01",
    studentId: "stu-20",
    subject: "Supporting Jannatul's final year",
    createdAt: "2026-10-24T08:30:00.000Z",
    updatedAt: "2026-10-24T12:10:00.000Z",
    unreadForDonor: 1,
    unreadForAdmin: 0,
    status: "open",
  },
  {
    id: "conv-04",
    donorId: "donor-03",
    studentId: "stu-02",
    subject: "Bank transfer confirmation",
    createdAt: "2026-10-26T10:20:00.000Z",
    updatedAt: "2026-10-27T09:15:00.000Z",
    unreadForDonor: 0,
    unreadForAdmin: 1,
    status: "open",
  },
  {
    id: "conv-05",
    donorId: "donor-05",
    studentId: "stu-13",
    subject: "Tania's clinical training costs",
    createdAt: "2026-10-24T17:40:00.000Z",
    updatedAt: "2026-10-26T11:20:00.000Z",
    unreadForDonor: 0,
    unreadForAdmin: 2,
    status: "open",
  },
  {
    id: "conv-06",
    donorId: "donor-02",
    studentId: "stu-18",
    subject: "Admission coaching support for Rafiul",
    createdAt: "2026-10-25T13:05:00.000Z",
    updatedAt: "2026-10-25T13:05:00.000Z",
    unreadForDonor: 0,
    unreadForAdmin: 1,
    status: "open",
  },
];

export const messages: Message[] = [
  // conv-01
  {
    id: "msg-0101",
    conversationId: "conv-01",
    authorRole: "donor",
    authorName: "Ayesha Rahman",
    body: "Assalamu alaikum. I would like to know whether Ayesha's current semester fee is still outstanding, and how donated funds are allocated to her.",
    createdAt: "2026-10-22T09:12:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0102",
    conversationId: "conv-01",
    authorRole: "admin",
    authorName: "CEBBD Support Team",
    body: "Wa alaikum assalam, and thank you for reaching out. Ayesha's semester fee of ৳18,500 is still outstanding. Approved donations are paid directly to the institute against her student account, and we share the receipt with the student and the donor.",
    createdAt: "2026-10-22T11:40:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0103",
    conversationId: "conv-01",
    authorRole: "donor",
    authorName: "Ayesha Rahman",
    body: "That is very helpful. I have submitted a donation through bKash this morning. Please let me know once it has been verified.",
    createdAt: "2026-10-23T08:05:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0104",
    conversationId: "conv-01",
    authorRole: "admin",
    authorName: "CEBBD Support Team",
    body: "We have received your submission. Our finance team verifies manual payments within 1–2 business days, and you will see the status change in your dashboard. Thank you for supporting Ayesha.",
    createdAt: "2026-10-23T10:22:00.000Z",
    readByDonor: false,
    readByAdmin: true,
  },

  // conv-02
  {
    id: "msg-0201",
    conversationId: "conv-02",
    authorRole: "donor",
    authorName: "Ayesha Rahman",
    body: "Hello. I would like to start a monthly sponsorship for Nusrat. Could you confirm the monthly amount and how the payments are tracked?",
    createdAt: "2026-10-20T14:03:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0202",
    conversationId: "conv-02",
    authorRole: "admin",
    authorName: "CEBBD Support Team",
    body: "Thank you for your generosity. Nusrat's monthly sponsorship is ৳1,500. Each month you can submit the transfer through bKash, Nagad, or bank, and our team records it against her campaign after verification.",
    createdAt: "2026-10-20T16:25:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0203",
    conversationId: "conv-02",
    authorRole: "donor",
    authorName: "Ayesha Rahman",
    body: "Understood. I will send the first monthly payment on 1 November. Please confirm that it will be applied to her hostel fees.",
    createdAt: "2026-10-25T16:47:00.000Z",
    readByDonor: true,
    readByAdmin: false,
  },

  // conv-03
  {
    id: "msg-0301",
    conversationId: "conv-03",
    authorRole: "donor",
    authorName: "Ayesha Rahman",
    body: "I read Jannatul's story and would like to help with her final year. Is the full scholarship amount fixed, or can it be split across the year?",
    createdAt: "2026-10-24T08:30:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0302",
    conversationId: "conv-03",
    authorRole: "admin",
    authorName: "CEBBD Support Team",
    body: "Thank you for your interest. The full scholarship amount is set per student by our team, but it can be paid in yearly or monthly instalments. We will confirm the exact remaining balance with the university before any transfer.",
    createdAt: "2026-10-24T12:10:00.000Z",
    readByDonor: false,
    readByAdmin: true,
  },

  // conv-04
  {
    id: "msg-0401",
    conversationId: "conv-04",
    authorRole: "donor",
    authorName: "Farzana Haque",
    body: "I made a bank transfer for Rakib yesterday. The reference is AC **** 4412. Could you confirm whether it has been received?",
    createdAt: "2026-10-26T10:20:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0402",
    conversationId: "conv-04",
    authorRole: "admin",
    authorName: "CEBBD Support Team",
    body: "Thank you for the reference. We have located the submission and it is currently pending verification. You will receive a confirmation in your dashboard within two business days.",
    createdAt: "2026-10-27T09:15:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },

  // conv-05
  {
    id: "msg-0501",
    conversationId: "conv-05",
    authorRole: "donor",
    authorName: "Sadia Noor",
    body: "Hello, I would like to cover part of Tania's clinical training fees. Which payment method is fastest to verify?",
    createdAt: "2026-10-24T17:40:00.000Z",
    readByDonor: true,
    readByAdmin: true,
  },
  {
    id: "msg-0502",
    conversationId: "conv-05",
    authorRole: "donor",
    authorName: "Sadia Noor",
    body: "I have now sent ৳2,500 through Nagad. The transaction ID is TRX-NG-55031.",
    createdAt: "2026-10-26T11:20:00.000Z",
    readByDonor: true,
    readByAdmin: false,
  },

  // conv-06
  {
    id: "msg-0601",
    conversationId: "conv-06",
    authorRole: "donor",
    authorName: "Tanvir Islam",
    body: "I would like to sponsor Rafiul's admission coaching. Is there a specific coaching centre that CEBBD works with?",
    createdAt: "2026-10-25T13:05:00.000Z",
    readByDonor: true,
    readByAdmin: false,
  },
];

export function messagesForConversation(conversationId: string) {
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}
