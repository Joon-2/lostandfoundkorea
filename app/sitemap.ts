import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { CATEGORIES } from "@/config/categories";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = siteConfig.url;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/report`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pay/delivery-only`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/coverage`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Only emit a category entry when there's at least one active facility in
  // it. Querying counts up-front avoids surfacing empty pages to crawlers.
  let active = new Set<string>();
  if (supabase) {
    const { data, error } = await supabase
      .from("facilities")
      .select("category")
      .eq("is_active", true);
    if (error) {
      console.error("[sitemap] facilities probe error:", error);
    } else {
      for (const row of data || []) active.add((row as { category: string }).category);
    }
  }

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES
    .filter((c) => active.has(c.key))
    .map((c) => ({
      url: `${base}/coverage/${c.key}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...categoryEntries];
}
