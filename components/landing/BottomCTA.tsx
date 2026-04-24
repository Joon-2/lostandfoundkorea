import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function BottomCTA() {
  const t = await getTranslations("bottomCTA");
  return (
    <section className="bg-alt">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-3xl bg-accent p-8 shadow-lg shadow-accent/20 sm:p-12">
          <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-xl text-base text-emerald-50/90">
            {t("body")}
          </p>
          <Link
            href="/report"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-accent shadow-sm transition-colors hover:bg-emerald-50"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
