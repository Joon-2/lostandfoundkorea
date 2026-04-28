import { getTranslations } from "next-intl/server";

// English-only homepage section. Speaks to travelers from anywhere —
// the value proposition is "we'll get it home, wherever home is".
// Server component; not loaded for /ja.

export default async function WorldwideShippingMap() {
  const t = await getTranslations("englishLocale.shippingMap");
  const regions: { name: string; example: string }[] = [
    { name: t("region1Name"), example: t("region1Example") },
    { name: t("region2Name"), example: t("region2Example") },
    { name: t("region3Name"), example: t("region3Example") },
    { name: t("region4Name"), example: t("region4Example") },
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
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {regions.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-muted">
                {r.name}
              </div>
              <div className="mt-1 text-sm text-foreground">{r.example}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
