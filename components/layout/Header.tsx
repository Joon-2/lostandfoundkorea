"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { WHATSAPP_URL } from "@/components/WhatsApp";
import MobileMenu, { type NavLink } from "@/components/layout/MobileMenu";

const NAV_LINKS: NavLink[] = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

function PinIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.33 6.62 11.77 6.9 12.04a.85.85 0 0 0 1.2 0C12.88 21.27 19.5 14.83 19.5 9.5 19.5 5.36 16.14 2 12 2zm0 10a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-[17px] font-bold tracking-tight text-black"
    >
      <PinIcon className="h-[18px] w-[18px] text-accent" />
      <span>Lost &amp; Found Korea</span>
    </Link>
  );
}

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
  const [open, setOpen] = useState(false);

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
            <Logo />
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
                  Need help?
                </a>
                <Link
                  href="/report"
                  className="hidden items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover md:inline-flex"
                >
                  Report
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
          logo={<Logo onClick={() => setOpen(false)} />}
        />
      )}
    </>
  );
}
