// Single source of truth for supported locales. Add a code here AND drop
// a matching file in /locales (UI strings) and the schema check
// constraint on facility_translations.locale to support a new language.
// Order in SUPPORTED_LOCALES is the picker order; first item is default.

export const SUPPORTED_LOCALES = ["en", "ko"] as const;
export const DEFAULT_LOCALE = "en" as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
};

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

// Pick the best supported locale from a value (cookie, header, etc.).
// Accepts BCP 47 codes; takes the primary subtag (e.g. "ko-KR" → "ko").
export function negotiateLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;
  // Accept-Language header style: "ko-KR,ko;q=0.9,en;q=0.8"
  const tags = value.split(",").map((s) => s.split(";")[0].trim().toLowerCase());
  for (const tag of tags) {
    const primary = tag.split("-")[0];
    if (isSupportedLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}
