import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { LANDING_PAGES } from "@/data/landing-pages/manifest";
import type { Locale } from "@/config/locales";

const LEGAL_LINKS = [
  { href: "/our-story", label: "Our Story" },
  { href: "/legal?tab=terms", label: "Terms" },
  { href: "/legal?tab=privacy", label: "Privacy" },
  { href: "/legal?tab=refund", label: "Refund" },
  { href: "/business-info", label: "Business Info" },
];

// Top guides shown in the footer's Resources section. Curated subset
// of the LANDING_PAGES manifest — most common search queries.
const RESOURCE_SLUGS = [
  "lost-passport",
  "lost-phone",
  "lost-wallet",
  "incheon-airport-lost-and-found",
  "seoul-taxi-lost-and-found",
  "seoul-subway-lost-and-found",
];

const RESOURCE_LABELS: Record<string, string> = {
  "lost-passport": "Lost passport in Korea",
  "lost-phone": "Lost phone in Korea",
  "lost-wallet": "Lost wallet in Korea",
  "lost-laptop": "Lost laptop in Korea",
  "incheon-airport-lost-and-found": "Incheon Airport lost & found",
  "gimpo-airport-lost-and-found": "Gimpo Airport lost & found",
  "seoul-taxi-lost-and-found": "Seoul taxi lost & found",
  "seoul-subway-lost-and-found": "Seoul subway lost & found",
  "japanese-tourist-guide": "Japanese traveler guide",
  "return-to-japan": "Already back in Japan",
};

function resourceLinks(locale: Locale) {
  const links = RESOURCE_SLUGS.map((slug) => {
    const entry = LANDING_PAGES.find((p) => p.slug === slug);
    if (!entry || !entry.locales.includes(locale)) return null;
    return { href: `/${slug}`, label: RESOURCE_LABELS[slug] };
  }).filter((l): l is { href: string; label: string } => l !== null);
  // For Japanese, also surface the JA-only guides up top.
  if (locale === "ja") {
    return [
      {
        href: "/japanese-tourist-guide",
        label: RESOURCE_LABELS["japanese-tourist-guide"],
      },
      { href: "/return-to-japan", label: RESOURCE_LABELS["return-to-japan"] },
      ...links,
    ];
  }
  return links;
}

export default async function Footer() {
  const t = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;
  const resources = resourceLinks(locale);

  return (
    <footer className="bg-navy text-slate-300" id="footer">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Lost item guides
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {resources.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {r.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Legal
            </p>
            <nav aria-label="Legal" className="mt-3 flex flex-col gap-2">
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-slate-700 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </span>
          <span>
            {siteConfig.location} &middot; {t("englishSupport")}
          </span>
        </div>
      </div>
    </footer>
  );
}
