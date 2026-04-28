import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BusinessInfo from "@/components/business-info/BusinessInfo";
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
    namespace: "meta.businessInfo",
    path: "/business-info",
  });
}

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
