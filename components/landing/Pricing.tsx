import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { plans } from "@/config/plans";
import TrackedReportLink from "@/components/analytics/TrackedReportLink";

type Tone = "free" | "popular" | "muted";

const TONE_STYLES: Record<Tone, { card: string; badge: string; price: string; cta: string }> = {
  free: {
    card: "border-accent/40 bg-card shadow-sm",
    badge: "bg-accent/10 text-accent border-accent/30",
    price: "text-accent",
    cta: "bg-accent text-white hover:bg-accent-hover",
  },
  popular: {
    card: "border-accent bg-card shadow-xl shadow-accent/10 ring-2 ring-accent/20",
    badge: "bg-accent text-white border-accent",
    price: "text-foreground",
    cta: "bg-accent text-white hover:bg-accent-hover",
  },
  muted: {
    card: "border-border bg-card shadow-sm",
    badge: "bg-alt text-muted border-border",
    price: "text-foreground",
    cta: "border border-border text-foreground hover:bg-alt",
  },
};

const FEATURES_PER_CARD = 4;

type Cta = { label: string; href: string; trackingLocation: string };

type PricingCardProps = {
  tone: Tone;
  badge: string;
  name: string;
  price: ReactNode;
  priceSubtext?: string;
  priceNote?: string;
  features: string[];
  bottomNote?: string;
  cta: Cta;
};

function PricingCard({
  tone,
  badge,
  name,
  price,
  priceSubtext,
  priceNote,
  features,
  bottomNote,
  cta,
}: PricingCardProps) {
  const t = TONE_STYLES[tone];
  const padded: (string | null)[] = features.slice(0, FEATURES_PER_CARD);
  while (padded.length < FEATURES_PER_CARD) padded.push(null);
  return (
    <div
      className={`relative flex flex-col gap-y-4 rounded-2xl border p-7 transition-shadow lg:row-span-11 lg:grid lg:grid-rows-subgrid ${t.card}`}
    >
      <span
        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${t.badge}`}
      >
        {badge}
      </span>
      <h3 className="font-serif text-2xl tracking-tight">{name}</h3>
      <span className={`font-serif text-5xl tracking-tight ${t.price}`}>
        {price}
      </span>
      <p className="text-sm font-medium text-foreground">
        {priceSubtext || " "}
      </p>
      <p className="text-sm text-muted">{priceNote}</p>
      <ul className="contents">
        {padded.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            {f ? (
              <>
                <svg
                  className="mt-0.5 h-4 w-4 flex-none text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-body">{f}</span>
              </>
            ) : (
              <span aria-hidden="true">&nbsp;</span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">{bottomNote || " "}</p>
      <TrackedReportLink
        href={cta.href}
        location={cta.trackingLocation}
        className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors ${t.cta}`}
      >
        {cta.label}
      </TrackedReportLink>
    </div>
  );
}

export default async function Pricing() {
  const t = await getTranslations("pricing");
  return (
    <section id="pricing" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-body">{t("subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:grid-rows-[repeat(11,_auto)]">
          <PricingCard
            tone="free"
            badge={t("recoveryBadge")}
            name={plans.recovery.name}
            price={plans.recovery.displayPrice}
            priceSubtext={t("recoveryPriceSubtext", {
              amount: plans.recovery.paymentPrice,
            })}
            priceNote={t("recoveryPriceNote")}
            features={plans.recovery.features}
            bottomNote={t("recoveryBottomNote", {
              footnote: plans.recovery.footnote,
              surcharge: plans.all_in_one.surcharge,
            })}
            cta={{
              label: t("recoveryCta"),
              href: "/report",
              trackingLocation: "pricing_recovery",
            }}
          />
          <PricingCard
            tone="popular"
            badge={t("allInOneBadge")}
            name={plans.all_in_one.name}
            price={`$${plans.all_in_one.priceSeoul}`}
            priceNote={t("allInOnePriceNote")}
            features={plans.all_in_one.features}
            bottomNote={plans.all_in_one.footnote}
            cta={{
              label: t("allInOneCta", { planName: plans.all_in_one.name }),
              href: "/report?plan=all_in_one",
              trackingLocation: "pricing_all_in_one",
            }}
          />
          <PricingCard
            tone="muted"
            badge={t("deliveryBadge")}
            name={plans.delivery_only.name}
            price={`$${plans.delivery_only.priceSeoul}`}
            priceNote={plans.delivery_only.description}
            features={plans.delivery_only.features}
            bottomNote={plans.delivery_only.footnote}
            cta={{
              label: t("deliveryCta"),
              href: "/pay/delivery-only",
              trackingLocation: "pricing_delivery",
            }}
          />
        </div>

        <p className="mt-10 text-center font-serif text-2xl tracking-tight sm:text-3xl">
          {t("noItemFoundLine1")}{" "}
          <span className="text-accent">{t("noItemFoundLine2")}</span>
        </p>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-alt p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-border bg-card text-accent"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <p className="text-sm leading-relaxed text-body">
              <span className="font-medium text-foreground">
                {t("shippingNoteBold")}
              </span>{" "}
              {t("shippingNoteBody")}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-[13px] text-muted">
          <p>{t("paymentMethodsTitle")}</p>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>{t("paymentMethodVisa")}</span>
            <span aria-hidden="true" className="text-muted/50">
              &middot;
            </span>
            <span>{t("paymentMethodPaypal")}</span>
            <span aria-hidden="true" className="text-muted/50">
              &middot;
            </span>
            <span>{t("paymentMethodApplePay")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
