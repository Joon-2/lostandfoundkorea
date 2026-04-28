import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { DEFAULT_LOCALE, type Locale } from "@/config/locales";

// Locale-aware URL: English at root, Japanese under /ja.
// Path should start with "/" or be empty for the homepage.
export function urlFor(locale: Locale, path: string): string {
  const cleaned = path.startsWith("/") ? path : path ? `/${path}` : "";
  if (locale === DEFAULT_LOCALE) return `${siteConfig.url}${cleaned}`;
  return `${siteConfig.url}/${locale}${cleaned}`;
}

// Builds a Next.js Metadata object from a meta.<page> namespace in the
// locale messages. Each page reads its title, description, keywords,
// and OG strings from the messages bundle so they can diverge between
// locales without the page touching translation strings directly.
//
// Pages still control their own canonical/url/path because that's
// page-specific routing data, not translatable copy.
export async function pageMetadata({
  locale,
  namespace,
  path,
}: {
  locale: Locale;
  namespace: string;
  path: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const url = urlFor(locale, path);
  const keywords = t("keywords")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return {
    title: { absolute: t("title") },
    description: t("description"),
    keywords,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url,
      locale: ogLocale(locale),
      type: "website",
    },
  };
}

// `<link rel="alternate" hreflang>` map for a given page path. Includes
// every supported locale plus an `x-default` pointing at the English
// (default) URL — that's what Google uses when no language preference
// matches.
export function languageAlternates(path: string) {
  return {
    en: urlFor("en", path),
    ja: urlFor("ja", path),
    "x-default": urlFor("en", path),
  };
}

// OG locale tag per BCP 47. ja → ja_JP, en → en_US.
export function ogLocale(locale: Locale): string {
  return locale === "ja" ? "ja_JP" : "en_US";
}
