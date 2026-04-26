import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StoryTabs from "@/components/story/StoryTabs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Our Story | ${siteConfig.name}`,
  description:
    "Why we built Lost & Found Korea — what we noticed, what stopped lost items from making it home, and what changed.",
  alternates: { canonical: `${siteConfig.url}/our-story` },
};

export default function OurStoryPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <StoryTabs />
      </main>
      <Footer />
    </div>
  );
}
