import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";

const LEGAL_LINKS = [
  { href: "/our-story", label: "Our Story" },
  { href: "/legal?tab=terms", label: "Terms" },
  { href: "/legal?tab=privacy", label: "Privacy" },
  { href: "/legal?tab=refund", label: "Refund" },
];

export default async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="bg-navy text-slate-300" id="footer">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-300 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <span>
          {siteConfig.location} &middot; {t("englishSupport")}
        </span>
      </div>
    </footer>
  );
}
