import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FaqClient from "@/components/faq/FaqClient";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `FAQ | ${siteConfig.name}`,
  description:
    "Answers to common questions about Lost & Found Korea — pricing, recovery process, shipping, insurance, and how the service works.",
  alternates: { canonical: `${siteConfig.url}/faq` },
};

export default function FaqPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10">
          <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-body">
            Everything we get asked about how Lost &amp; Found Korea works.
            Search below or browse by category.
          </p>
        </header>
        <FaqClient />
      </main>
      <Footer />
    </div>
  );
}
