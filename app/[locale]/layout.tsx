import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { FloatingWhatsApp } from "@/components/WhatsApp";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/config/locales";

// Per-locale shell. Validates that [locale] is one of the configured
// routing locales and mounts NextIntlClientProvider here (not in the
// root layout) so the locale and messages stay in sync on client-side
// navigation between / and /ja. Anything outside [locale] (admin, api)
// uses no translations, so it doesn't need the provider.

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
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <FloatingWhatsApp />
    </NextIntlClientProvider>
  );
}
