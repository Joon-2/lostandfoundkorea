import { getTranslations } from "next-intl/server";

// Japanese-only. Builds trust by explicitly naming the gap between
// Japanese and Korean lost-and-found culture (Lost112, hotel
// procedures, the language wall) and positioning LFK as the bridge.

export default async function KoreanLostFoundExplainer() {
  const t = await getTranslations("japanLocale.lostFoundExplainer");
  const paragraphs = [t("paragraph1"), t("paragraph2"), t("paragraph3")];

  return (
    <section className="border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </div>
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[17px] leading-relaxed text-body"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
