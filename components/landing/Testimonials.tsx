const TESTIMONIALS = [
  {
    quote:
      "I left my passport at a restaurant in Myeongdong. They found it within 6 hours. Lifesaver!",
    name: "Sarah M.",
    country: "United States",
  },
  {
    quote:
      "Lost my wallet on the KTX to Busan. I was already back in Japan when they located it and shipped it to me.",
    name: "Kenji T.",
    country: "Japan",
  },
  {
    quote:
      "My phone fell out on the subway. I had no idea how to use Lost112 in Korean. They handled everything.",
    name: "Emma L.",
    country: "United Kingdom",
  },
  {
    quote:
      "Found my camera bag that I left at Incheon Airport in under 24 hours. Worth every dollar.",
    name: "Lucas R.",
    country: "Germany",
  },
];

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
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

export default function Testimonials() {
  return (
    <section id="testimonials" className="border-y border-border bg-alt">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h2 className="text-center font-serif text-3xl tracking-tight sm:text-4xl">
          Trusted by travelers
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-body">
          Real stories from people who got their belongings back.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
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
                <StarRow />
                <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm text-muted">
                  <span className="font-medium text-foreground">{t.name}</span>
                  <span className="mx-2 text-muted/60">&middot;</span>
                  {t.country}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
