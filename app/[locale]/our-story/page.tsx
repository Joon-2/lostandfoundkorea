import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StoryTabs from "@/components/story/StoryTabs";
import type { Locale } from "@/config/locales";
import { languageAlternates, ogLocale, urlFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      absolute: "Our Story — Lost & Found Korea | Why We Built This Service",
    },
    description:
      "We saw too many foreigner items sitting unclaimed in Korean lost and found offices. We built LFK to bridge the language gap and bring lost belongings home.",
    alternates: {
      canonical: urlFor(locale, "/our-story"),
      languages: languageAlternates("/our-story"),
    },
    openGraph: {
      url: urlFor(locale, "/our-story"),
      locale: ogLocale(locale),
    },
  };
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
