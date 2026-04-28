import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import { CATEGORIES, getCategoryDef } from "@/config/categories";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type Locale,
} from "@/config/locales";
import {
  resolveFacility,
  indexTranslations,
} from "@/lib/facility-i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type {
  Facility,
  FacilityRow,
  FacilityTranslation,
} from "@/types/facility";

export const revalidate = 60;

type RouteParams = { params: Promise<{ category: string }> };

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { category } = await params;
  const def = getCategoryDef(category);
  if (!def) return {};
  const title = `${def.label} — Lost & Found Info Book — ${siteConfig.name}`;
  const description = def.description;
  const url = `${siteConfig.url}/coverage/${def.key}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.key }));
}

async function getFacilities(
  category: string,
  locale: Locale
): Promise<Facility[]> {
  if (!supabase) return [];
  const { data: rows, error: rowError } = await supabase
    .from("facilities")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (rowError) {
    console.error("[coverage/category] row fetch error:", rowError);
    return [];
  }
  const ids = (rows || []).map((r) => r.id);
  if (ids.length === 0) return [];
  const { data: trs, error: tError } = await supabase
    .from("facility_translations")
    .select("*")
    .in("facility_id", ids);
  if (tError) {
    console.error("[coverage/category] translations fetch error:", tError);
  }
  const grouped = indexTranslations((trs || []) as FacilityTranslation[]);
  const resolved = (rows || []).map((row) =>
    resolveFacility(row as FacilityRow, grouped.get(row.id) || [], locale)
  );
  resolved.sort((a, b) => {
    const so = (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity);
    if (so !== 0) return so;
    return (a.name || "").localeCompare(b.name || "");
  });
  return resolved;
}

function mapsHref(address: string | null) {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function telHref(phone: string | null) {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}

export default async function CategoryPage({ params }: RouteParams) {
  const { category } = await params;
  const def = getCategoryDef(category);
  if (!def) notFound();

  const t = await getTranslations("coverage");
  const localeRaw = await getLocale();
  const locale: Locale = isSupportedLocale(localeRaw)
    ? localeRaw
    : DEFAULT_LOCALE;
  const facilities = await getFacilities(category, locale);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/coverage"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← {t("title")}
        </Link>
        <div className="mt-4 flex items-start gap-4">
          <span aria-hidden="true" className="text-4xl leading-none">
            {def.emoji}
          </span>
          <div>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              {def.label}
            </h1>
            <p className="mt-2 max-w-2xl text-body">{def.description}</p>
          </div>
        </div>

        {facilities.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-border bg-alt px-5 py-12 text-center text-sm text-muted">
            {t("categoryEmpty")}
          </p>
        ) : (
          <div className="mt-10 space-y-5">
            {facilities.map((f) => (
              <FacilityCard key={f.id} facility={f} t={t} />
            ))}
          </div>
        )}

        <section className="mt-16 rounded-3xl bg-accent p-8 shadow-lg shadow-accent/20 sm:p-10">
          <h2 className="font-serif text-2xl tracking-tight text-white sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-emerald-50/90">{t("ctaBody")}</p>
          <Link
            href="/report"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-accent shadow-sm transition-colors hover:bg-emerald-50"
          >
            {t("ctaButton")} →
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function FacilityCard({
  facility: f,
  t,
}: {
  facility: Facility;
  t: (key: string) => string;
}) {
  const tel = telHref(f.phone);
  const tel2 = telHref(f.phone_2);
  const maps = mapsHref(f.address);
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl tracking-tight text-foreground">
          {f.name}
        </h3>
        {f.location_detail && (
          <span className="rounded-full border border-border bg-alt px-3 py-1 text-xs text-muted">
            {f.location_detail}
          </span>
        )}
      </header>

      {f.description && (
        <p className="mt-3 whitespace-pre-wrap text-body">{f.description}</p>
      )}

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {f.phone && (
          <Row label={t("phone")}>
            {tel ? (
              <a href={tel} className="font-mono text-accent hover:underline">
                {f.phone}
              </a>
            ) : (
              <span className="font-mono text-foreground">{f.phone}</span>
            )}
          </Row>
        )}
        {f.phone_2 && (
          <Row label={t("phoneAlt")}>
            {tel2 ? (
              <a href={tel2} className="font-mono text-accent hover:underline">
                {f.phone_2}
              </a>
            ) : (
              <span className="font-mono text-foreground">{f.phone_2}</span>
            )}
          </Row>
        )}
        {f.email && (
          <Row label={t("email")}>
            <a
              href={`mailto:${f.email}`}
              className="text-accent hover:underline"
            >
              {f.email}
            </a>
          </Row>
        )}
        {f.hours && (
          <Row label={t("hours")}>
            <span>
              {f.hours}
              {f.hours_note && (
                <span className="text-muted"> · {f.hours_note}</span>
              )}
            </span>
          </Row>
        )}
        {f.address && (
          <Row label={t("address")}>
            <div>
              <div className="text-foreground">{f.address}</div>
              {maps && (
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-accent hover:underline"
                >
                  {t("openInMaps")} ↗
                </a>
              )}
            </div>
          </Row>
        )}
        {f.website && (
          <Row label={t("website")}>
            <a
              href={f.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {f.website.replace(/^https?:\/\//, "")}
            </a>
          </Row>
        )}
      </dl>

      {(f.how_to_report || f.how_to_trace || f.retention_period) && (
        <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
          {f.how_to_report && (
            <Block label={t("howToReport")} body={f.how_to_report} />
          )}
          {f.how_to_trace && (
            <Block label={t("howToTrace")} body={f.how_to_trace} />
          )}
          {f.retention_period && (
            <Block label={t("retentionPeriod")} body={f.retention_period} />
          )}
        </div>
      )}

      {f.tags && f.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {f.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-alt px-2.5 py-0.5 text-[11px] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-foreground">{children}</dd>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-body">{body}</p>
    </div>
  );
}
