"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/config/locales";

// Simple "EN | 日本語" toggle. The active locale is bold + accent;
// the inactive one is muted and clickable. Clicking navigates to the
// same path in the other locale and updates the NEXT_LOCALE cookie
// (next-intl's localized router handles both — replace with the
// `locale` option re-routes via the matching prefix).

export default function LanguageSwitcher() {
  const current = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: Locale) => {
    if (next === current) return;
    router.replace(pathname, { locale: next });
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
