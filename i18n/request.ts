import { getRequestConfig } from "next-intl/server";

// next-intl is running in "without i18n routing" mode per CLAUDE.md — no
// [locale] segments, no middleware. The active locale is hardcoded to "en"
// for now. ja / zh locale files are present but empty; next-intl falls
// back to the default message when a key is missing. Switch this to read
// from a cookie or header when we're ready to let users pick a language.
export const SUPPORTED_LOCALES = ["en", "ja", "zh"] as const;
export const DEFAULT_LOCALE = "en";
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async () => {
  const locale: Locale = DEFAULT_LOCALE;
  const englishMessages = (await import("@/locales/en.json")).default;
  let messages: typeof englishMessages = englishMessages;
  if (locale !== "en") {
    try {
      const localeMessages = (await import(`@/locales/${locale}.json`)).default;
      messages = mergeMessages(englishMessages, localeMessages);
    } catch {
      messages = englishMessages;
    }
  }
  return { locale, messages };
});

// Deep-merge locale messages on top of English, so any key missing from a
// non-English locale file (empty string or undefined) falls back to the
// English copy instead of rendering blank.
function mergeMessages(base: any, overlay: any): any {
  if (
    typeof base !== "object" ||
    base === null ||
    typeof overlay !== "object" ||
    overlay === null
  ) {
    return overlay && typeof overlay === "string" && overlay.length > 0
      ? overlay
      : base;
  }
  const out: any = { ...base };
  for (const key of Object.keys(overlay)) {
    out[key] = mergeMessages(base?.[key], overlay[key]);
  }
  return out;
}
