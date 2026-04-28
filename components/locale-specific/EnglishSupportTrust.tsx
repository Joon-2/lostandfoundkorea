import { getTranslations } from "next-intl/server";

// English-only homepage section. Three reassurances that matter most
// to English-speaking visitors: native English communication, no
// translation/cultural barrier, and direct PayPal/USD payment with no
// FX surprises.

export default async function EnglishSupportTrust() {
  const t = await getTranslations("englishLocale.supportTrust");
  const points: { title: string; body: string }[] = [
    { title: t("point1Title"), body: t("point1Body") },
    { title: t("point2Title"), body: t("point2Body") },
    { title: t("point3Title"), body: t("point3Body") },
  ];

  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.title}>
              <h3 className="font-serif text-lg tracking-tight text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
