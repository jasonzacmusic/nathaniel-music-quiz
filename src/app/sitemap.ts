import { MetadataRoute } from "next";
import sql from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://quiz.nathanielschool.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/theory`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/notation`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/challenge`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/ear-training`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic: quiz set play pages
  let playPages: MetadataRoute.Sitemap = [];
  try {
    const sets = await sql`SELECT set_id FROM quiz_sets WHERE quiz_type = 'ear_training' ORDER BY set_id`;
    playPages = (sets as { set_id: string }[]).map((s) => ({
      url: `${baseUrl}/play/${s.set_id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable — skip dynamic pages
  }

  // Dynamic: category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const cats = await sql`SELECT DISTINCT category FROM questions WHERE quiz_type = 'ear_training' AND category IS NOT NULL`;
    categoryPages = (cats as { category: string }[]).map((c) => ({
      url: `${baseUrl}/category/${encodeURIComponent(c.category)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable
  }

  return [...staticPages, ...playPages, ...categoryPages];
}
