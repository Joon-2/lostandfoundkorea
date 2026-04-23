import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import AboutUs from "@/components/landing/AboutUs";
import Pricing from "@/components/landing/Pricing";
import BottomCTA from "@/components/landing/BottomCTA";
import { plans } from "@/config/plans";
import { siteConfig } from "@/config/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    description:
      "Lost something while traveling in Korea? Report it in 4 simple steps and our local team will help recover it. Fast, trustworthy, English-speaking support.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Seoul",
      addressCountry: "South Korea",
    },
    priceRange: `Free - $${plans.all_in_one.priceSeoul}`,
  };

  return (
    <div className="flex flex-1 flex-col">
      <script
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
