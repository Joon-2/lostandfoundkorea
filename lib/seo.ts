import { siteConfig } from "@/config/site";
import { DEFAULT_LOCALE, type Locale } from "@/config/locales";

// Locale-aware URL: English at root, Japanese under /ja.
// Path should start with "/" or be empty for the homepage.
export function urlFor(locale: Locale, path: string): string {
  const cleaned = path.startsWith("/") ? path : path ? `/${path}` : "";
  if (locale === DEFAULT_LOCALE) return `${siteConfig.url}${cleaned}`;
  return `${siteConfig.url}/${locale}${cleaned}`;
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
