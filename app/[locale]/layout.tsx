import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/config/locales";

// Per-locale shell. Validates that [locale] is one of the configured
// routing locales and tells next-intl which locale to use for static
// rendering. Doesn't render html/body — that lives in the root layout
// so /admin and /api keep working.

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);
  return children;
}
