import { plans } from "@/config/plans";

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
    body: `Pay $${plans.recovery.paymentPrice} to get the exact location, contact info, and English pickup instructions. Need delivery? We handle that too.`,
  },
];

export default function HowItWorks() {
  return (
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
            <p className="mt-2 text-sm leading-relaxed text-body">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
