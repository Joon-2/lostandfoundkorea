import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BusinessInfo from "@/components/business-info/BusinessInfo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `Business Info · ${siteConfig.name}` },
  description:
    "Operating company, business registration, and contact details for Lost & Found Korea, in accordance with the Korean Act on the Consumer Protection in Electronic Commerce.",
  alternates: { canonical: `${siteConfig.url}/business-info` },
};

export default function BusinessInfoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <BusinessInfo />
      </main>
      <Footer />
    </div>
  );
}
