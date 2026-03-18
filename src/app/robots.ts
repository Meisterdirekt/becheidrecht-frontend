import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/intern/",
          "/angebot/",
          "/rahmenvertrag/",
          "/pitch-deck/",
          "/einrichtung/",
          "/test-ki/",
        ],
      },
    ],
    sitemap: "https://www.bescheidrecht.de/sitemap.xml",
  };
}
