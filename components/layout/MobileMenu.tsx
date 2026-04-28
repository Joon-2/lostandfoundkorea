"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export type NavLink = { href: string; label: string };

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  whatsappUrl: string;
  logo: ReactNode;
};

function CloseIcon() {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function MobileMenu({
  open,
  onClose,
  navLinks,
  whatsappUrl,
  logo,
}: MobileMenuProps) {
  const t = useTranslations("nav");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
      <div className="flex h-[60px] items-center justify-between border-b border-[#e5e7eb] px-5">
        {logo}
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-[#f3f4f6]"
        >
          <CloseIcon />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-5 py-6">
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="rounded-md px-2 py-3 text-lg font-medium text-foreground transition-colors hover:bg-[#f3f4f6]"
          >
            {l.label}
          </a>
        ))}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="rounded-md px-2 py-3 text-lg font-medium text-body transition-colors hover:bg-[#f3f4f6]"
        >
          {t("needHelp")}
        </a>
        <Link
          href="/report"
          onClick={onClose}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          {t("report")}
        </Link>
        <div className="mt-6 border-t border-[#e5e7eb] pt-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted">
            Language
          </p>
          <div className="px-2">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
    </div>
  );
}
