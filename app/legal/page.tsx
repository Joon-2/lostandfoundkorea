import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegistrationBanner from "@/components/legal/RegistrationBanner";
import LegalTabs from "@/components/legal/LegalTabs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Legal · ${siteConfig.name}`,
  description:
    "Terms of Service, Privacy Policy, and Refund Policy for Lost & Found Korea.",
  alternates: { canonical: `${siteConfig.url}/legal` },
};

export default function LegalPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <RegistrationBanner />
        <LegalTabs />
      </main>
      <Footer />
    </div>
  );
}
