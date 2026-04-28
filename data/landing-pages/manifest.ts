import type { Locale } from "@/config/locales";

// Source of truth for SEO landing pages. Adding a new page:
//   1. Drop a <slug>.<locale>.json file in this directory
//   2. Add the slug here with the locales it ships in
//   3. Sitemap and the [slug] route pick it up automatically
//
// Categories are descriptive only — used to group links in the
// Resources section on the homepage; no routing impact.

export type LandingCategory = "item" | "location" | "guide";

export type LandingEntry = {
  slug: string;
  category: LandingCategory;
  locales: readonly Locale[];
};

export const LANDING_PAGES: readonly LandingEntry[] = [
  // Category A — item-type
  { slug: "lost-passport", category: "item", locales: ["en", "ja"] },
  { slug: "lost-phone", category: "item", locales: ["en", "ja"] },
  { slug: "lost-wallet", category: "item", locales: ["en", "ja"] },
  { slug: "lost-laptop", category: "item", locales: ["en", "ja"] },
  // Category B — location
  {
    slug: "incheon-airport-lost-and-found",
    category: "location",
    locales: ["en", "ja"],
  },
  {
    slug: "gimpo-airport-lost-and-found",
    category: "location",
    locales: ["en", "ja"],
  },
  {
    slug: "seoul-taxi-lost-and-found",
    category: "location",
    locales: ["en", "ja"],
  },
  {
    slug: "seoul-subway-lost-and-found",
    category: "location",
    locales: ["en", "ja"],
  },
  // Category C — Japanese-only guides
  { slug: "japanese-tourist-guide", category: "guide", locales: ["ja"] },
  { slug: "return-to-japan", category: "guide", locales: ["ja"] },
] as const;

export const ALL_LANDING_SLUGS = LANDING_PAGES.map((p) => p.slug);

export function landingEntry(slug: string): LandingEntry | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

export function landingExists(slug: string, locale: Locale): boolean {
  const entry = landingEntry(slug);
  return Boolean(entry && entry.locales.includes(locale));
}

// Type for the JSON content file. Pages that don't need every field
// can omit them (steps and faqs default to empty arrays).
export type LandingConfig = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  heroBody: string;
  steps?: { title: string; body: string }[];
  faqs?: { q: string; a: string }[];
  ctaLabel: string;
  internalLinks?: { href: string; label: string }[];
};

export async function loadLandingConfig(
  slug: string,
  locale: Locale
): Promise<LandingConfig | null> {
  if (!landingExists(slug, locale)) return null;
  try {
    const mod = await import(`./${slug}.${locale}.json`);
    return mod.default as LandingConfig;
  } catch {
    return null;
  }
}
