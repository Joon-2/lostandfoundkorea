import { getTranslations } from "next-intl/server";

const QUOTE_KEYS = ["sarah", "kenji", "emma", "lucas"] as const;

function StarRow({ label }: { label: string }) {
  return (
    <div className="flex gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 text-amber-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.367-2.447a1 1 0 0 0-1.176 0l-3.367 2.447c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 0 0-.363-1.118L2.098 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
}

export default async function Testimonials() {
  const t = await getTranslations("testimonials");
  return (
    <section id="testimonials" className="border-y border-border bg-alt">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h2 className="text-center font-serif text-3xl tracking-tight sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-body">
          {t("subtitle")}
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {QUOTE_KEYS.map((key, i) => (
            <figure
              key={key}
              className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-border p-6 shadow-sm sm:p-7 ${
                i % 2 === 0 ? "bg-card" : "bg-[#f0fdf4]"
              }`}
            >
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute -left-2 -top-4 h-24 w-24 text-[#d1fae5]"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <path d="M30 25c-11 0-20 9-20 20v30h30V45H20c0-5.5 4.5-10 10-10V25zm45 0c-11 0-20 9-20 20v30h30V45H65c0-5.5 4.5-10 10-10V25z" />
              </svg>
              <div className="relative">
                <StarRow label={t("starLabel")} />
                <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-foreground">
                  &ldquo;{t(`${key}Quote`)}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm text-muted">
                  <span className="font-medium text-foreground">
                    {t(`${key}Name`)}
                  </span>
                  <span className="mx-2 text-muted/60">&middot;</span>
                  {t(`${key}Country`)}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
