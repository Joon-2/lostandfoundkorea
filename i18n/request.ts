import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  negotiateLocale,
  type Locale,
} from "@/config/locales";

export const LOCALE_COOKIE = "lfk-locale";

// Detection priority:
//   1. lfk-locale cookie (user-set override)
//   2. Accept-Language header (browser preference)
//   3. DEFAULT_LOCALE
// English messages are always loaded as the base; the chosen locale's
// non-empty strings are deep-merged on top so any missing key falls
// back to English without rendering blank.

export default getRequestConfig(async () => {
  const locale = await detectLocale();
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

async function detectLocale(): Promise<Locale> {
  // Cookie override
  try {
    const store = await cookies();
    const cookieValue = store.get(LOCALE_COOKIE)?.value;
    if (cookieValue && isSupportedLocale(cookieValue)) return cookieValue;
  } catch {
    // cookies() throws outside a request scope (e.g. during build).
  }
  // Browser preference
  try {
    const h = await headers();
    const accept = h.get("accept-language");
    if (accept) return negotiateLocale(accept);
  } catch {}
  return DEFAULT_LOCALE;
}

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
