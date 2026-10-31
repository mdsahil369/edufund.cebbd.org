import type { PaymentSettings, SiteSettings } from "@/types";

export const paymentSettings: PaymentSettings = {
  bank: {
    bankName: "Dutch-Bangla Bank",
    accountName: "Community Empowerment Bangladesh",
    accountNumber: "1021 3456 7890",
    branch: "Gulshan Branch, Dhaka",
    routingNumber: "090261726",
  },
  bkash: {
    number: "01711-000000",
    accountType: "Merchant account",
  },
  nagad: {
    number: "01811-000000",
    accountType: "Personal account",
  },
  instructions: [
    "Send the exact amount shown in your donation summary. Do not deduct transfer fees from the donation.",
    "Use your donation reference number as the transaction reference where the payment method allows it.",
    "Keep a screenshot or receipt of the payment until your donation has been verified.",
    "After submitting this form, our finance team will verify the transaction within 1–2 business days.",
    "You will see the donation status change in your dashboard once verification is complete.",
  ],
  verificationNote:
    "Only donations verified by the CEBBD finance team are added to a student's campaign total. Pending submissions never count toward fundraising progress.",
  supportEmail: "donations@cebbd.org",
  supportPhone: "+880 1700-000000",
  updatedAt: "2026-10-01T09:00:00.000Z",
};

export const siteSettings: SiteSettings = {
  siteName: "EduFund CEBBD",
  organization: "Community Empowerment Bangladesh",
  tagline: "Every student deserves a chance to dream.",
  description:
    "EduFund CEBBD connects generous supporters with financially disadvantaged students across Bangladesh, helping them continue their education with dignity and transparency.",
  contactEmail: "hello@cebbd.org",
  contactPhone: "+880 1700-000000",
  address: "House 12, Road 5, Gulshan 1, Dhaka 1212, Bangladesh",
  announcement:
    "Diploma scholarship applications for the 2026–27 session are now open.",
  announcementHref: "/students",
  socials: {
    facebook: "https://facebook.com/cebbd",
    instagram: "https://instagram.com/cebbd",
    linkedin: "https://linkedin.com/company/cebbd",
    youtube: "https://youtube.com/@cebbd",
  },
  donationNote:
    "All donations are processed manually and verified by the CEBBD finance team before they are added to a student's campaign.",
};
