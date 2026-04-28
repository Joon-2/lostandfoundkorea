"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/config/locales";

// "EN | 日本語" toggle. Clicking the inactive locale persists the
// choice via NEXT_LOCALE cookie and navigates to the same page in
// the other locale.
//
// Why we don't use router.replace(pathname, { locale }) from
// @/i18n/navigation: that combination produced /ja/ja in production
// under next-intl 4.9.1 + localePrefix "as-needed", at least on the
// /ja homepage. We construct the URL explicitly here and hand it to
// the native Next.js router so the path is unambiguous.
//
// usePathname() is still imported from @/i18n/navigation because it
// returns the locale-stripped path (e.g. "/our-story" on either
// /our-story or /ja/our-story). The defensive regex strips the
// prefix again as belt-and-suspenders against the possibility that
// next-intl returns the prefixed path in some edge case.

const LOCALE_PREFIX_RE = /^\/(en|ja)(?=\/|$)/;

export default function LanguageSwitcher() {
  const current = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: Locale) => {
    if (next === current) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const stripped = (pathname || "/").replace(LOCALE_PREFIX_RE, "") || "/";
    const newUrl =
      next === DEFAULT_LOCALE
        ? stripped
        : `/${next}${stripped === "/" ? "" : stripped}`;
    router.replace(newUrl);
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center gap-2 text-sm"
    >
      {SUPPORTED_LOCALES.map((loc, i) => {
        const isActive = loc === current;
        return (
          <span key={loc} className="flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className="px-2 text-muted/60">
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => switchTo(loc)}
              aria-current={isActive ? "true" : undefined}
              className={
                isActive
                  ? "font-semibold text-accent"
                  : "text-muted transition-colors hover:text-foreground"
              }
            >
              {LOCALE_LABELS[loc]}
            </button>
          </span>
        );
      })}
    </div>
  );
}
