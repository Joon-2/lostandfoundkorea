"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { WHATSAPP_URL } from "@/components/WhatsApp";
import MobileMenu, { type NavLink } from "@/components/layout/MobileMenu";
import Logo from "@/components/ui/Logo";

function HamburgerIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

type HeaderProps = {
  variant?: "marketing" | "simple";
  action?: ReactNode;
};

export default function Header({ variant = "marketing", action = null }: HeaderProps) {
  const t = useTranslations("nav");
  const tb = useTranslations("brand");
  const [open, setOpen] = useState(false);

  const NAV_LINKS: NavLink[] = [
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/#pricing", label: t("pricing") },
    { href: "/coverage", label: t("infoBook") },
    { href: "/our-story", label: t("ourStory") },
    { href: "/faq", label: t("faq") },
  ];

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [open]);

  const isMarketing = variant === "marketing";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex h-[60px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-8">
            <Logo name={tb("nameAmpersand")} />
            {isMarketing && (
              <nav className="hidden items-center gap-6 md:flex">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-sm text-body transition-colors hover:text-black"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isMarketing ? (
              <>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden text-sm text-body transition-colors hover:text-black md:inline"
                >
                  {t("needHelp")}
                </a>
                <Link
                  href="/report"
                  className="hidden items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover md:inline-flex"
                >
                  {t("report")}
                </Link>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={open}
                  onClick={() => setOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-[#f3f4f6] md:hidden"
                >
                  <HamburgerIcon />
                </button>
              </>
            ) : (
              action
            )}
          </div>
        </div>
      </header>

      {isMarketing && (
        <MobileMenu
          open={open}
          onClose={() => setOpen(false)}
          navLinks={NAV_LINKS}
          whatsappUrl={WHATSAPP_URL}
          logo={<Logo name={tb("nameAmpersand")} onClick={() => setOpen(false)} />}
        />
      )}
    </>
  );
}
