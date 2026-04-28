import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LegalTabs from "@/components/legal/LegalTabs";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/config/locales";
import { languageAlternates, ogLocale, urlFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: { absolute: `Legal · ${siteConfig.name}` },
    description:
      "Terms of Service, Privacy Policy, and Refund Policy for Lost & Found Korea.",
    alternates: {
      canonical: urlFor(locale, "/legal"),
      languages: languageAlternates("/legal"),
    },
    openGraph: {
      url: urlFor(locale, "/legal"),
      locale: ogLocale(locale),
    },
  };
}

export default function LegalPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <LegalTabs />
      </main>
      <Footer />
    </div>
  );
}
