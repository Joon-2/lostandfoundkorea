import Link from "next/link";
import Header from "@/components/Header";

const STEPS = [
  {
    n: "01",
    title: "Tell us what you lost",
    body: "Fill out a quick 30-second form with what you lost and where. It's free.",
  },
  {
    n: "02",
    title: "We search in Korean",
    body: "Our team contacts Lost112, police stations, subway operators, bus companies, and taxi services — all in Korean so you don't have to.",
  },
  {
    n: "03",
    title: "Get notified",
    body: "We email you as soon as your item is located, usually within 24-48 hours.",
  },
  {
    n: "04",
    title: "Unlock & retrieve",
    body: "Pay $39 to get the exact location, contact info, and English pickup instructions. Need delivery? We handle that too.",
  },
];

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

const FEATURES_PER_CARD = 4;

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
}) {
  const t = TONE_STYLES[tone];
  const isExternal = cta.href.startsWith("mailto:") || cta.href.startsWith("http");
  const CtaTag = isExternal ? "a" : Link;
  const padded = features.slice(0, FEATURES_PER_CARD);
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
        {priceSubtext || "\u00a0"}
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
      <p className="text-xs text-muted">{bottomNote || "\u00a0"}</p>
      <CtaTag
        href={cta.href}
        className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors ${t.cta}`}
      >
        {cta.label}
      </CtaTag>
    </div>
  );
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Lost and Found Korea",
    url: "https://lostandfoundkorea.com",
    description:
      "Lost something while traveling in Korea? Report it in 4 simple steps and our local team will help recover it. Fast, trustworthy, English-speaking support.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Seoul",
      addressCountry: "South Korea",
    },
    priceRange: "Free - $79",
  };

  return (
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-alt px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              English-speaking support, based in Seoul
            </p>
            <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Lost something in Korea?
              <br />
              <span className="text-accent">We&rsquo;ll find it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
              Travelers lose thousands of items every day across Seoul, Busan,
              and Jeju. Our local team navigates the language barrier and
              recovery process for you.
            </p>
            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-accent">&#10003;</span>
                Free to report
              </span>
              <span aria-hidden="true" className="text-muted/50">
                &middot;
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-accent">&#10003;</span>
                Pay only when we find it
              </span>
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report"
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
              >
                Start a report &rarr;
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-alt"
              >
                How it works
              </a>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-alt">
          <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
            <p className="mb-5 text-xs font-medium uppercase tracking-widest text-muted">
              We help recover
            </p>
            <div className="flex flex-wrap gap-2">
              {ITEMS.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm"
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
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="font-serif text-3xl text-accent">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

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
                      <span className="font-medium text-foreground">
                        {t.name}
                      </span>
                      <span className="mx-2 text-muted/60">&middot;</span>
                      {t.country}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="border-b border-border">
          <div className="mx-auto w-full max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-24">
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
              Who we are
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-body">
              We&rsquo;re a Seoul-based team of bilingual Koreans who help
              foreigners navigate Korea&rsquo;s lost and found system. We speak
              fluent Korean and English, and we know exactly how to work with
              Lost112, police stations, transit authorities, and taxi
              companies. Since Korea&rsquo;s lost item recovery system is
              almost entirely in Korean, most foreigners give up before even
              trying. That&rsquo;s where we come in.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-alt px-4 py-2 text-sm font-medium text-foreground">
                <span aria-hidden="true">🇰🇷</span>
                Based in Seoul
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-alt px-4 py-2 text-sm font-medium text-foreground">
                <span aria-hidden="true">💬</span>
                Bilingual Korean–English
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-alt px-4 py-2 text-sm font-medium text-foreground">
                <span aria-hidden="true">📋</span>
                500+ Items Recovered
              </span>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
                Simple, fair pricing
              </h2>
              <p className="mt-3 text-body">
                Start free. You only pay when we actually find your item.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:grid-rows-[repeat(11,_auto)]">
              <PricingCard
                tone="free"
                badge="Pay if found"
                name="Recovery"
                price="FREE"
                priceSubtext="→ $39 only when we find your item"
                priceNote="Free to start. No card needed."
                features={[
                  "Submit a 30-second report",
                  "Our team searches in Korean on your behalf",
                  "Email update within 24-48 hours",
                  "Pay $39 to unlock pickup details — only if found",
                ]}
                bottomNote="Pickup add-on from +$59 · Outside Seoul/Gyeonggi +$20"
                cta={{ label: "Start free →", href: "/report" }}
              />
              <PricingCard
                tone="popular"
                badge="Recommended"
                name="All-in-One"
                price="$79"
                priceNote="Search + delivery to your address"
                features={[
                  "Everything in Recovery",
                  "We coordinate pickup with the venue / authorities",
                  "Domestic or international shipping included",
                  "Single price upfront — no add-on fees",
                ]}
                bottomNote="Outside Seoul/Gyeonggi +$20"
                cta={{ label: "Start All-in-One", href: "/report?plan=all_in_one" }}
              />
              <PricingCard
                tone="muted"
                badge="Already located"
                name="Delivery Only"
                price="$49"
                priceNote="When you already know where the item is"
                features={[
                  "You tell us where the item is being held",
                  "We pick it up and ship it to your address",
                  "Korean-language coordination on your behalf",
                  "Tracking number emailed once it ships",
                ]}
                bottomNote="Outside Seoul/Gyeonggi +$20"
                cta={{ label: "Start Delivery", href: "/pay/delivery-only" }}
              />
            </div>

            <p className="mt-10 text-center font-serif text-2xl tracking-tight sm:text-3xl">
              No item found?{" "}
              <span className="text-accent">You pay nothing.</span>
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
                    Shipping costs are calculated after we locate and assess
                    your item.
                  </span>{" "}
                  We&rsquo;ll send you an exact quote before any shipment
                  &mdash; no surprises. Customs duties and import taxes are
                  the recipient&rsquo;s responsibility. All prices in USD.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-[13px] text-muted">
              <p>We accept PayPal, Visa, Mastercard, and Apple Pay</p>
              <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span>💳 Visa / Mastercard</span>
                <span aria-hidden="true" className="text-muted/50">
                  &middot;
                </span>
                <span>🅿️ PayPal</span>
                <span aria-hidden="true" className="text-muted/50">
                  &middot;
                </span>
                <span>🍎 Apple Pay</span>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-alt">
          <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="rounded-3xl bg-accent p-8 shadow-lg shadow-accent/20 sm:p-12">
              <h2 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
                Ready to get your item back?
              </h2>
              <p className="mt-3 max-w-xl text-base text-emerald-50/90">
                Submit a report in about 2 minutes. We&rsquo;ll reach out within
                24 hours.
              </p>
              <Link
                href="/report"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-accent shadow-sm transition-colors hover:bg-emerald-50"
              >
                Start a report &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy text-slate-300" id="footer">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>&copy; {new Date().getFullYear()} Lost and Found Korea</span>
          <span>Seoul, Korea &middot; English-speaking support</span>
        </div>
      </footer>
    </div>
  );
}
