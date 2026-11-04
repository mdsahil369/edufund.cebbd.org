import type { MetadataRoute } from "next";
import { getPublishedStudents } from "@/lib/services/students";

const baseUrl = "https://edufund.cebbd.org";
const LAST_UPDATED = new Date("2026-10-31");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/students", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/achievements", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const students = await getPublishedStudents();

  const studentRoutes = students
    .filter((student) => student.campaignStatus !== "draft")
    .map((student) => ({
      url: `${baseUrl}/students/${student.slug}`,
      lastModified: new Date(student.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: LAST_UPDATED,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...studentRoutes,
  ];
}
