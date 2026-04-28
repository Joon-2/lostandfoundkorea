import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/config/categories";
import { supabase } from "@/lib/supabase";
import { languageAlternates, urlFor } from "@/lib/seo";

export const revalidate = 3600;

type StaticEntry = {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

const STATIC_PATHS: StaticEntry[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/report", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pay/delivery-only", changeFrequency: "monthly", priority: 0.6 },
  { path: "/coverage", changeFrequency: "weekly", priority: 0.7 },
  { path: "/our-story", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/business-info", changeFrequency: "yearly", priority: 0.3 },
];

// Each public page is emitted once per locale. The `alternates.languages`
// map points search engines at the matching URL in each other language so
// they can pick the right one for the user.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap(
    ({ path, changeFrequency, priority }) => {
      const alternates = { languages: languageAlternates(path) };
      return [
        {
          url: urlFor("en", path),
          lastModified: now,
          changeFrequency,
          priority,
          alternates,
        },
        {
          url: urlFor("ja", path),
          lastModified: now,
          changeFrequency,
          priority,
          alternates,
        },
      ];
    }
  );

  // Only emit a category entry when there's at least one active facility in
  // it. Querying counts up-front avoids surfacing empty pages to crawlers.
  const active = new Set<string>();
  if (supabase) {
    const { data, error } = await supabase
      .from("facilities")
      .select("category")
      .eq("is_active", true);
    if (error) {
      console.error("[sitemap] facilities probe error:", error);
    } else {
      for (const row of data || [])
        active.add((row as { category: string }).category);
    }
  }

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.filter((c) =>
    active.has(c.key)
  ).flatMap((c) => {
    const path = `/coverage/${c.key}`;
    const alternates = { languages: languageAlternates(path) };
    return [
      {
        url: urlFor("en", path),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates,
      },
      {
        url: urlFor("ja", path),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates,
      },
    ];
  });

  return [...staticEntries, ...categoryEntries];
}
