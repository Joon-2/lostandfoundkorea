import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "@/components/landing-pages/LandingPage";
import {
  LANDING_PAGES,
  loadLandingConfig,
} from "@/data/landing-pages/manifest";
import type { Locale } from "@/config/locales";
import { languageAlternates, ogLocale, urlFor } from "@/lib/seo";

// Catch-all SEO landing-page route. Slugs and per-locale availability
// come from the LANDING_PAGES manifest; content comes from
// data/landing-pages/<slug>.<locale>.json. Anything that doesn't
// resolve to a real (slug, locale) pair returns 404.
//
// Specific named routes (/report, /faq, /our-story, etc.) take
// priority over [slug] in Next.js routing, so they're unaffected.

type RouteParams = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateStaticParams() {
  return LANDING_PAGES.flatMap((page) =>
    page.locales.map((locale) => ({ locale, slug: page.slug }))
  );
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { locale, slug } = await params;
  const config = await loadLandingConfig(slug, locale);
  if (!config) return {};
  const path = `/${slug}`;
  const url = urlFor(locale, path);
  return {
    title: { absolute: config.metaTitle },
    description: config.metaDescription,
    keywords: config.keywords,
    alternates: {
      canonical: url,
      // Only emit the languages map for slugs that actually exist in
      // both locales; JA-only guides shouldn't dangle an /en alternate.
      languages: bothLocaleLanguages(slug, path),
    },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url,
      locale: ogLocale(locale),
      type: "article",
    },
  };
}

function bothLocaleLanguages(slug: string, path: string) {
  const entry = LANDING_PAGES.find((p) => p.slug === slug);
  if (!entry) return undefined;
  if (entry.locales.length === 1) return undefined;
  return languageAlternates(path);
}

export default async function LandingSlugPage({ params }: RouteParams) {
  const { locale, slug } = await params;
  const config = await loadLandingConfig(slug, locale);
  if (!config) notFound();
  return <LandingPage config={config} />;
}
