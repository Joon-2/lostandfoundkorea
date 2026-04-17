import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Tell us what you lost",
    body: "Share contact info, item details, and where you last had it — takes about 2 minutes.",
  },
  {
    n: "02",
    title: "Our team starts looking",
    body: "Local Korean-speaking staff contact transit lost-and-found offices, businesses, and police stations on your behalf.",
  },
  {
    n: "03",
    title: "We get it back to you",
    body: "Once recovered, we coordinate pickup or international shipping to wherever you are.",
  },
];

const ITEMS = [
  "Phones",
  "Wallets",
  "Passports",
  "Cameras",
  "Laptops",
  "Bags",
  "Jewelry",
  "Documents",
];

const TONE_STYLES = {
  free: {
    card: "border-emerald-500/40 bg-card",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    price: "text-emerald-400",
    cta: "bg-emerald-500 text-white hover:bg-emerald-600",
  },
  popular: {
    card: "border-accent bg-card ring-2 ring-accent/30 lg:scale-[1.02] lg:shadow-2xl lg:shadow-accent/10",
    badge: "bg-accent text-white border-accent",
    price: "text-foreground",
    cta: "bg-accent text-white hover:bg-accent-hover",
  },
  muted: {
    card: "border-border bg-card/60",
    badge: "bg-card text-muted border-border",
    price: "text-muted",
    cta: "border border-border text-foreground hover:bg-card",
  },
};

function PricingCard({ tone, badge, name, price, priceNote, features, cta }) {
  const t = TONE_STYLES[tone];
  const isExternal = cta.href.startsWith("mailto:") || cta.href.startsWith("http");
  const CtaTag = isExternal ? "a" : Link;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 transition-shadow ${t.card}`}
    >
      <span
        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${t.badge}`}
      >
        {badge}
      </span>
      <h3 className="mt-5 font-serif text-2xl tracking-tight">{name}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-serif text-5xl tracking-tight ${t.price}`}>
          {price}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">{priceNote}</p>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
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
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
      <CtaTag
        href={cta.href}
        className={`mt-7 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors ${t.cta}`}
      >
        {cta.label}
      </CtaTag>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Lost & Found Korea
          </Link>
          <nav className="flex items-center gap-5">
            <a
              href="#pricing"
              className="hidden text-sm text-muted hover:text-foreground sm:inline"
            >
              Pricing
            </a>
            <Link
              href="/report"
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Report
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              English-speaking support, based in Seoul
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Lost something in Korea?
              <br />
              <span className="text-accent">We&rsquo;ll find it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Travelers lose thousands of items every day across Seoul, Busan,
              and Jeju. Our local team navigates the language barrier and
              recovery process for you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report"
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Start a report &rarr;
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-card"
              >
                How it works
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
            <p className="mb-5 text-xs font-medium uppercase tracking-widest text-muted">
              We help recover
            </p>
            <div className="flex flex-wrap gap-2">
              {ITEMS.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
        >
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="font-serif text-3xl text-accent">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="border-t border-border/60 bg-card/20"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
                Simple, fair pricing
              </h2>
              <p className="mt-3 text-muted">
                Start free. You only pay when we actually find your item.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <PricingCard
                tone="free"
                badge="Start here"
                name="Submit a report"
                price="Free"
                priceNote="No credit card"
                features={[
                  "Tell us about your lost item in 2 min",
                  "Our team begins the search immediately",
                  "Email status updates",
                  "Pay nothing if we don't find it",
                ]}
                cta={{ label: "Start a report", href: "/report" }}
              />
              <PricingCard
                tone="popular"
                badge="Most Popular"
                name="Recovery"
                price="$39"
                priceNote="One-time, only if found"
                features={[
                  "Everything in Submit a report",
                  "Unlock full details once located",
                  "Coordinated pickup or domestic shipping",
                  "Direct line to your case handler",
                ]}
                cta={{ label: "Start a report", href: "/report" }}
              />
              <PricingCard
                tone="muted"
                badge="Concierge"
                name="Priority"
                price="$89"
                priceNote="For urgent or high-value items"
                features={[
                  "Everything in Recovery",
                  "Priority search within 12 hours",
                  "On-the-ground search in the area",
                  "International shipping included",
                ]}
                cta={{ label: "Contact us", href: "mailto:hello@lostandfoundkorea.com" }}
              />
            </div>

            <p className="mt-10 text-center font-serif text-2xl tracking-tight sm:text-3xl">
              No item found?{" "}
              <span className="text-accent">You pay nothing.</span>
            </p>
          </div>
        </section>

        <section className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-background p-8 sm:p-12">
              <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
                Ready to get your item back?
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                Submit a report in about 2 minutes. We&rsquo;ll reach out within
                24 hours.
              </p>
              <Link
                href="/report"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Start a report &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60" id="footer">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>&copy; {new Date().getFullYear()} Lost and Found Korea</span>
          <span>Seoul, Korea &middot; English-speaking support</span>
        </div>
      </footer>
    </div>
  );
}
