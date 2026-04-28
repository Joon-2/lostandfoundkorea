import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StoryTabs from "@/components/story/StoryTabs";
import type { Locale } from "@/config/locales";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    namespace: "meta.ourStory",
    path: "/our-story",
  });
}

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
