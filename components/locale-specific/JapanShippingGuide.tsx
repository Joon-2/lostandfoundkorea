import { getTranslations } from "next-intl/server";

// Japanese-only homepage section. EMS Korea → Japan is fast and cheap;
// surface that as a concrete reassurance instead of generic
// international-shipping copy. Server component — no client-side
// JS shipped, and skipping this section on the English homepage means
// the component isn't rendered there at all.

export default async function JapanShippingGuide() {
  const t = await getTranslations("japanLocale.shippingGuide");
  const points: { title: string; body: string }[] = [
    { title: t("point1Title"), body: t("point1Body") },
    { title: t("point2Title"), body: t("point2Body") },
    { title: t("point3Title"), body: t("point3Body") },
    { title: t("point4Title"), body: t("point4Body") },
  ];

  return (
    <section className="border-t border-border bg-alt">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-body">{t("subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {points.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
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
