import type { Achievement } from "@/types";

/**
 * CEBBD achievements are intentionally code-managed, not editable from the
 * admin dashboard. Add or remove entries here and the homepage/achievements
 * page will update automatically. The homepage reveals three at a time.
 */
export const achievements: Achievement[] = [
  {
    id: "ach-01",
    title: "1,200 students supported across all 64 districts",
    description:
      "CEBBD reached a milestone this quarter: more than 1,200 students have received education support since the programme began, from Sylhet's tea gardens to the river islands of Barishal.",
    date: "2026-09-28",
    image: "/images/achievements/achievement-1.svg",
    category: "Milestone",
    metric: "1,200+ students",
  },
  {
    id: "ach-02",
    title: "Digital learning lab opens in Rangpur",
    description:
      "A new community learning lab with 20 workstations now offers free computer and internet access to diploma students in Rangpur, supported by CEBBD donors and local partners.",
    date: "2026-08-16",
    image: "/images/achievements/achievement-2.svg",
    category: "Infrastructure",
    metric: "20 workstations",
  },
  {
    id: "ach-03",
    title: "Annual scholarship gala raises ৳2.4 million",
    description:
      "Supporters, alumni, and partner organisations gathered in Dhaka for CEBBD's annual gala. The evening raised ৳2.4 million for the 2027 scholarship fund.",
    date: "2026-07-05",
    image: "/images/achievements/achievement-3.svg",
    category: "Fundraising",
    metric: "৳2.4M raised",
  },
  {
    id: "ach-04",
    title: "17 diploma scholars begin the 2026 academic year",
    description:
      "Seventeen newly selected diploma scholars started classes this month across polytechnic and nursing institutes, with full semester fees and mentoring support in place.",
    date: "2026-05-22",
    image: "/images/achievements/achievement-4.svg",
    category: "Scholarships",
    metric: "17 new scholars",
  },
  {
    id: "ach-05",
    title: "CEBBD partners with three polytechnic institutes",
    description:
      "Formal partnerships with three institutes will allow CEBBD to verify student records faster and pay fees directly to institutional accounts.",
    date: "2026-04-10",
    image: "/images/achievements/achievement-5.svg",
    category: "Partnerships",
    metric: "3 institutes",
  },
  {
    id: "ach-06",
    title: "Emergency education fund supports 40 flood-affected families",
    description:
      "When flooding disrupted schooling in the north, CEBBD's emergency fund provided learning materials, uniforms, and transport support to 40 affected families.",
    date: "2026-02-14",
    image: "/images/achievements/achievement-6.svg",
    category: "Emergency response",
    metric: "40 families",
  },
  {
    id: "ach-07",
    title: "First cohort of nursing scholars graduates",
    description:
      "Eight nursing scholars completed their diplomas and are now serving in rural health centres across Barishal and Khulna divisions.",
    date: "2025-12-20",
    image: "/images/achievements/achievement-7.svg",
    category: "Graduation",
    metric: "8 graduates",
  },
  {
    id: "ach-08",
    title: "Women in STEM mentorship programme launches",
    description:
      "Forty-eight female diploma students were paired with working engineers and technologists for a year-long mentorship programme.",
    date: "2025-10-08",
    image: "/images/achievements/achievement-8.svg",
    category: "Programme",
    metric: "48 mentees",
  },
  {
    id: "ach-09",
    title: "Community donors cross 900 active supporters",
    description:
      "Our community of regular supporters passed 900 people this month, with monthly sponsorships becoming the fastest-growing form of giving.",
    date: "2025-08-30",
    image: "/images/achievements/achievement-9.svg",
    category: "Community",
    metric: "900+ supporters",
  },
];
