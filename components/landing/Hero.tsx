import Link from "next/link";

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

export default function Hero() {
  return (
    <>
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
    </>
  );
}
