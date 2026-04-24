import { getTranslations } from "next-intl/server";

export default async function AboutUs() {
  const t = await getTranslations("aboutUs");
  return (
    <section id="about" className="border-b border-border">
      <div className="mx-auto w-full max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-24">
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-body">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-alt px-4 py-2 text-sm font-medium text-foreground">
            <span aria-hidden="true">🇰🇷</span>
            {t("badgeSeoul")}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-alt px-4 py-2 text-sm font-medium text-foreground">
            <span aria-hidden="true">💬</span>
            {t("badgeBilingual")}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-alt px-4 py-2 text-sm font-medium text-foreground">
            <span aria-hidden="true">📋</span>
            {t("badgeRecovered")}
          </span>
        </div>
      </div>
    </section>
  );
}
