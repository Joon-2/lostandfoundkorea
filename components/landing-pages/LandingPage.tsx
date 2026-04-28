import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "@/i18n/navigation";
import type { LandingConfig } from "@/data/landing-pages/manifest";

// Shared shell for every SEO landing page. Content comes from the
// per-(slug, locale) JSON file; this component just renders it.
// Server component — no client-side state, full HTML in the SSR
// response is what we want for SEO.

type Props = {
  config: LandingConfig;
};

export default function LandingPage({ config }: Props) {
  const steps = config.steps ?? [];
  const faqs = config.faqs ?? [];
  const internalLinks = config.internalLinks ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <header>
          <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            {config.h1}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body">
            {config.heroBody}
          </p>
          <div className="mt-7">
            <Link
              href="/report"
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              {config.ctaLabel}
            </Link>
          </div>
        </header>

        {steps.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              How LFK helps
            </h2>
            <ol className="mt-5 space-y-5">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg tracking-tight text-foreground">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-body">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl tracking-tight text-foreground">
              Frequently asked
            </h2>
            <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
              {faqs.map((f, i) => (
                <div key={i} className="px-5 py-4 sm:px-6 sm:py-5">
                  <h3 className="font-medium text-foreground">{f.q}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 rounded-2xl bg-accent p-7 text-white shadow-lg shadow-accent/20 sm:p-9">
          <h2 className="font-serif text-2xl tracking-tight">
            Lost something? Tell us what.
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-emerald-50/90">
            Free to start. Pay only when we find it.
          </p>
          <Link
            href="/report"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-accent shadow-sm transition-colors hover:bg-emerald-50"
          >
            {config.ctaLabel}
          </Link>
        </section>

        {internalLinks.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Related guides
            </h2>
            <ul className="mt-3 space-y-2">
              {internalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[15px] text-accent hover:underline"
                  >
                    {l.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
