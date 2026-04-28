import type { Metadata } from "next";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import AboutUs from "@/components/landing/AboutUs";
import Pricing from "@/components/landing/Pricing";
import BottomCTA from "@/components/landing/BottomCTA";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/config/locales";
import { pageMetadata, urlFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = await pageMetadata({
    locale,
    namespace: "meta.home",
    path: "",
  });
  // Add OG image — page-level merge with the layout/root defaults.
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      siteName: "Lost & Found Korea",
      images: [
        {
          url: "/og-image.png?v=2",
          width: 1200,
          height: 630,
          alt:
            (await getTranslations({ locale, namespace: "meta.home" }))(
              "ogAlt"
            ) || "Lost & Found Korea",
        },
      ],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  // LocalBusiness schema. Strings come from the meta.home namespace so
  // both locales emit JSON-LD in the user's language.
  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: t("schemaBusinessName"),
    alternateName: "LFK",
    description: t("schemaBusinessDescription"),
    url: urlFor(locale, ""),
    image: `${siteConfig.url}/og-image.png`,
    logo: `${siteConfig.url}/web-app-manifest-512x512.png`,
    priceRange: "$$",
    areaServed: [
      { "@type": "City", name: "Seoul" },
      { "@type": "City", name: "Busan" },
      { "@type": "City", name: "Jeju" },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: "Gyeonggi-do",
      addressLocality: "Yongin-si",
    },
    availableLanguage: ["en", "ja"],
  };

  // Service schema — describes the recovery service itself, separate
  // from the LocalBusiness entity. Helps rich-results show "service
  // offered" snippets.
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("schemaServiceName"),
    description: t("schemaServiceDescription"),
    provider: {
      "@type": "LocalBusiness",
      name: t("schemaBusinessName"),
      url: urlFor(locale, ""),
    },
    areaServed: t("schemaAreaServed"),
    availableLanguage: ["en", "ja"],
    serviceType: "Lost item recovery and international shipping",
  };

  return (
    <div className="flex flex-1 flex-col">
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <Script
        id="schema-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <Header />

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Testimonials />
        <AboutUs />
        <Pricing />
        <BottomCTA />
      </main>

      <Footer />
    </div>
  );
}
