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
    number: "+880 1886-345441",
    accountType: "bKash account",
  },
  nagad: {
    number: "",
    accountType: "Not available — use bKash or bank transfer",
  },
  instructions: [
    "Send the exact amount shown in your donation summary. Do not deduct transfer fees from the donation.",
    "Use your full name and the student's name as the payment reference where the method allows it.",
    "Keep a screenshot, SMS, or receipt of the payment until your donation has been verified.",
    "After submitting the donation form, the CEBBD team will verify the transaction within 1–2 business days.",
    "You can follow the status of every donation in your donor dashboard.",
  ],
  international: [
    "Donors outside Bangladesh can pay by Visa / Mastercard through our bank's card or international transfer service using the CEBBD bank details shown above.",
    "If your bank does not support a direct transfer, ask your bank for an international remittance to the CEBBD account and keep the bank reference number (SWIFT / MT103 reference).",
    "Submit that bank reference number in the donation form so our finance team can match the payment to your donation.",
    "Card and international payments are verified manually — no card details are ever collected on this website.",
    "For help with an international payment, WhatsApp our President, MD. ANWARUL HASAN, before or after sending the transfer.",
  ],
  whatsapp: {
    name: "MD. ANWARUL HASAN",
    number: "+974 7056 9169",
  },
  verificationNote:
    "Only donations verified by the CEBBD finance team are added to a student's campaign total. Pending submissions never count toward fundraising progress.",
  supportEmail: "info@cebbd.org",
  supportPhone: "+880 1927 327549",
  updatedAt: "2026-11-10T09:00:00.000Z",
};

/**
 * Settings stored in Supabase (or an older localStorage cache) can miss fields
 * added in a later release, so every nested value is merged onto the defaults.
 */
export function mergePaymentSettings(
  stored?: Partial<PaymentSettings> | null,
): PaymentSettings {
  if (!stored) return paymentSettings;
  return {
    ...paymentSettings,
    ...stored,
    bank: { ...paymentSettings.bank, ...(stored.bank ?? {}) },
    bkash: { ...paymentSettings.bkash, ...(stored.bkash ?? {}) },
    nagad: { ...paymentSettings.nagad, ...(stored.nagad ?? {}) },
    whatsapp: { ...paymentSettings.whatsapp, ...(stored.whatsapp ?? {}) },
    instructions:
      Array.isArray(stored.instructions) && stored.instructions.length > 0
        ? stored.instructions
        : paymentSettings.instructions,
    international:
      Array.isArray(stored.international) && stored.international.length > 0
        ? stored.international
        : paymentSettings.international,
  };
}

export function mergeSiteSettings(
  stored?: Partial<SiteSettings> | null,
): SiteSettings {
  if (!stored) return siteSettings;
  return {
    ...siteSettings,
    ...stored,
    socials: { ...siteSettings.socials, ...(stored.socials ?? {}) },
  };
}

export const siteSettings: SiteSettings = {
  siteName: "EduFund CEBBD",
  organization: "Community Empowerment Bangladesh",
  tagline: "Just $17 a month. Four Years. A Future Transformed.",
  description:
    "EduFund CEBBD connects generous supporters with financially disadvantaged students across Bangladesh, helping them continue their education with dignity and transparency.",
  contactEmail: "info@cebbd.org",
  contactPhone: "+880 1927 327549",
  address: "98, Prembagan, Dhaka",
  announcement:
    "Diploma scholarship applications for the 2026–27 session are now open.",
  announcementHref: "/students",
  socials: {
    facebook:
      "https://www.facebook.com/people/Community-Empowerment-Bangladesh/61567136819905/",
    instagram: "https://x.com",
    linkedin: "https://www.linkedin.com",
    youtube: "https://www.youtube.com",
  },
  donationNote:
    "All donations are processed manually and verified by the CEBBD finance team before they are added to a student's campaign.",
};
