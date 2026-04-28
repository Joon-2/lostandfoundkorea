import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FaqClient from "@/components/faq/FaqClient";
import type { Locale } from "@/config/locales";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, namespace: "meta.faq", path: "/faq" });
}

export default async function FaqPage() {
  const t = await getTranslations("faq");
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-10">
          <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            {t("h1")}
          </h1>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-body">
            {t("subtitle")}
          </p>
        </header>
        <FaqClient />
      </main>
      <Footer />
    </div>
  );
}
