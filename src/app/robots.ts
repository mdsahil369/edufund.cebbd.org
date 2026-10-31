import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/admin",
          "/admin/",
          "/login",
          "/register",
          "/forgot-password",
        ],
      },
    ],
    sitemap: "https://edufund.cebbd.org/sitemap.xml",
    host: "https://edufund.cebbd.org",
  };
}
