import type { Achievement } from "@/types";

/**
 * CEBBD milestones. Intentionally code-managed, not editable from the admin
 * dashboard. Only include things the organisation can stand behind — no
 * illustrative or projected figures.
 */
export const achievements: Achievement[] = [
  {
    id: "ach-01",
    title: "18 diploma students shortlisted for the 2026–27 session",
    description:
      "From hundreds of SSC and HSC dropouts, CEB has carefully shortlisted 18 deserving students who can begin a Diploma in Engineering with sponsorship support.",
    date: "2026-10-01",
    image: "/images/achievements/achievement-1.svg",
    category: "Scholarships",
    metric: "18 students",
  },
  {
    id: "ach-02",
    title: "Home and institute visits completed for every shortlisted student",
    description:
      "A CEBBD volunteer team visited each shortlisted family and their polytechnic to confirm financial need, enrolment eligibility, and the exact fees due.",
    date: "2026-09-20",
    image: "/images/achievements/achievement-2.svg",
    category: "Verification",
    metric: "100% verified",
  },
  {
    id: "ach-03",
    title: "Manual payment verification added to every donation",
    description:
      "Every bKash, bank, and international transfer now carries a transaction or bank reference that the finance team matches before a donation counts.",
    date: "2026-09-05",
    image: "/images/achievements/achievement-3.svg",
    category: "Transparency",
    metric: "Every payment checked",
  },
  {
    id: "ach-04",
    title: "Donors can now track donations from pending to approved",
    description:
      "The donor dashboard shows the full history of each contribution, so supporters can see exactly when a payment was verified and added to a campaign.",
    date: "2026-08-18",
    image: "/images/achievements/achievement-4.svg",
    category: "Technology",
    metric: "Live dashboard",
  },
  {
    id: "ach-05",
    title: "Three sponsorship tiers introduced: $17, $13, and $9 a month",
    description:
      "Supporters can now choose full support (2,100 taka), partial support (1,600 taka), or a smaller monthly contribution (1,100 taka) for the same student.",
    date: "2026-08-01",
    image: "/images/achievements/achievement-5.svg",
    category: "Programme",
    metric: "3 monthly tiers",
  },
  {
    id: "ach-06",
    title: "Yearly and full-scholarship support made available",
    description:
      "Donors can cover two semesters at once (7,000 taka) or fund a student's entire diploma (56,000 taka), with fees paid directly to the institution.",
    date: "2026-07-12",
    image: "/images/achievements/achievement-6.svg",
    category: "Programme",
    metric: "2 new options",
  },
];
