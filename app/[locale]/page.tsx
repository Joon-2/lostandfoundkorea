import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import AboutUs from "@/components/landing/AboutUs";
import Pricing from "@/components/landing/Pricing";
import BottomCTA from "@/components/landing/BottomCTA";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute:
      "Lost & Found Korea | English Lost Item Recovery in Seoul, Busan, Jeju",
  },
  description:
    "Lost something in Korea? We help foreigners recover lost passports, wallets, phones, and luggage. Free to start — pay only when found. Bilingual support in Seoul, Busan, Jeju.",
  keywords: [
    "lost and found korea",
    "lost passport korea",
    "lost item seoul",
    "korea lost luggage",
    "incheon airport lost",
    "lost wallet korea",
    "foreigner lost item recovery",
  ],
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Lost & Found Korea",
    alternateName: "LFK",
    description: "English-speaking lost item recovery service in Korea",
    url: siteConfig.url,
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
    availableLanguage: ["English", "Korean", "Japanese"],
  };

  return (
    <div className="flex flex-1 flex-col">
      <Script
        id="schema-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
