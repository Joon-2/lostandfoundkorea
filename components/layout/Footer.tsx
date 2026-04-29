import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/ui/Logo";
import { siteConfig } from "@/config/site";

// Footer link list. The href is fixed; the label is a key resolved
// via getTranslations("footer") so each locale supplies its own copy.
const LEGAL_LINKS: { href: string; key: string }[] = [
  { href: "/our-story", key: "ourStory" },
  { href: "/legal?tab=terms", key: "terms" },
  { href: "/legal?tab=privacy", key: "privacy" },
  { href: "/legal?tab=refund", key: "refund" },
  { href: "/business-info", key: "businessInfo" },
];

export default async function Footer() {
  const t = await getTranslations("footer");
  const tBrand = await getTranslations("brand");

  return (
    <footer
      className="border-t border-[#e5e7eb] bg-background"
      id="footer"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          <div className="md:col-span-2">
            <Logo
              name={tBrand("nameAmpersand")}
              iconClassName="h-[20px] w-[20px]"
            />
            <p className="mt-3 max-w-md text-sm text-muted">{t("tagline")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              {t("legalHeading")}
            </p>
            <nav
              aria-label={t("legalHeading")}
              className="mt-3 flex flex-col gap-3"
            >
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-body transition-colors duration-150 hover:text-accent"
                >
                  {t(`links.${l.key}`)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-[#e5e7eb] pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
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
