import { getTranslations } from "next-intl/server";
import { plans } from "@/config/plans";

const STEP_KEYS = ["01", "02", "03", "04"] as const;

export default async function HowItWorks() {
  const t = await getTranslations("howItWorks");
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
    >
      <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
        {t("title")}
      </h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEP_KEYS.map((n) => (
          <div
            key={n}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="font-serif text-3xl text-accent">{n}</div>
            <h3 className="mt-4 text-lg font-semibold">
              {t(`step${n}Title`)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-body">
              {t(`step${n}Body`, { amount: plans.recovery.paymentPrice })}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
