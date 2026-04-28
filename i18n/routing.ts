import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/config/locales";

// Single source of truth for next-intl routing. `localePrefix: "as-needed"`
// keeps English at the root (no /en prefix) and serves Japanese under /ja.
export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
});
