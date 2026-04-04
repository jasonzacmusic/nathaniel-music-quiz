import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/results"],
    },
    sitemap: "https://quiz.nathanielschool.com/sitemap.xml",
  };
}
