import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import { CATEGORIES } from "@/config/categories";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Facility, FacilityCategory } from "@/types/facility";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Lost & Found Info Book — ${siteConfig.name}`,
  description:
    "A directory of phone numbers, hours, and policies for the places that handle lost items in Korea — airports, subways, taxis, hotels, police, and more.",
  alternates: { canonical: `${siteConfig.url}/coverage` },
  openGraph: {
    title: `Lost & Found Info Book — ${siteConfig.name}`,
    description:
      "Phone numbers, hours, and policies for handling lost items in Korea.",
    url: `${siteConfig.url}/coverage`,
    type: "website",
  },
};

async function getCounts(): Promise<Record<FacilityCategory, number>> {
  const empty = CATEGORIES.reduce((acc, c) => {
    acc[c.key] = 0;
    return acc;
  }, {} as Record<FacilityCategory, number>);
  if (!supabase) return empty;
  const { data, error } = await supabase
    .from("facilities")
    .select("category")
    .eq("is_active", true);
  if (error) {
    console.error("[coverage] count fetch error:", error);
    return empty;
  }
  const counts = { ...empty };
  for (const row of (data || []) as Pick<Facility, "category">[]) {
    if (row.category in counts) {
      counts[row.category] += 1;
    }
  }
  return counts;
}

export default async function CoveragePage() {
  const t = await getTranslations("coverage");
  const counts = await getCounts();
  const populated = CATEGORIES.filter((c) => counts[c.key] > 0);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-body">{t("subtitle")}</p>

        <h2 className="mt-12 text-xs font-semibold uppercase tracking-widest text-muted">
          {t("browseCategories")}
        </h2>

        {populated.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border bg-alt px-5 py-8 text-center text-sm text-muted">
            {t("categoryEmpty")}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {populated.map((c) => {
              const count = counts[c.key];
              return (
                <Link
                  key={c.key}
                  href={`/coverage/${c.key}`}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-hover"
                >
                  <span
                    aria-hidden="true"
                    className="text-3xl leading-none"
                  >
                    {c.emoji}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl tracking-tight text-foreground">
                      {c.label}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {count === 1
                        ? t("entryCountOne")
                        : t("entryCount", { count })}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-body">
                      {c.description}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-1 text-muted transition-colors group-hover:text-accent"
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
