import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE } from "@/config/locales";
import { routing } from "./routing";

// Loads English messages as the base, then deep-merges the requested
// locale's non-empty strings on top. Any missing key in ja.json silently
// falls back to en.json — the same pattern used pre-prefix-routing.

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const englishMessages = (await import("@/locales/en.json")).default;
  let messages: typeof englishMessages = englishMessages;
  if (locale !== DEFAULT_LOCALE) {
    try {
      const overlay = (await import(`@/locales/${locale}.json`)).default;
      messages = mergeMessages(englishMessages, overlay);
    } catch {
      messages = englishMessages;
    }
  }
  return { locale, messages };
});

function mergeMessages(base: any, overlay: any): any {
  // Arrays are leaf values for translation purposes. Spreading an array
  // into an object literal (`{...arr}`) silently produces a numeric-keyed
  // plain object, which then breaks consumers that call `.slice()` etc.
  // on `t.raw()` results — the cause of the /ja 500 we saw on the
  // homepage's Pricing section.
  if (Array.isArray(overlay)) {
    return overlay.length > 0 ? overlay : base;
  }
  if (Array.isArray(base)) {
    return base;
  }
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
