import { getTranslations } from "next-intl/server";

// Japanese-only. Visual reassurance row of payment + shipping badges
// that Japanese travelers specifically scan for: PayPal, credit cards,
// EMS tracking. Light on copy, heavy on visual confidence.

function CheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 text-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default async function JapaneseTrustBadges() {
  const t = await getTranslations("japanLocale.trustBadges");
  const badges = [t("paypal"), t("creditCard"), t("emsTracking"), t("insurance")];

  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
          {t("eyebrow")}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {badges.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-emerald-50 px-4 py-2 text-sm font-medium text-foreground"
            >
              <CheckIcon />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
