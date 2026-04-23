export default function AboutUs() {
  return (
    <section id="about" className="border-b border-border">
      <div className="mx-auto w-full max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-24">
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Who we are
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-body">
          We&rsquo;re a Seoul-based team of bilingual Koreans who help
          foreigners navigate Korea&rsquo;s lost and found system. We speak
          fluent Korean and English, and we know exactly how to work with
          Lost112, police stations, transit authorities, and taxi companies.
          Since Korea&rsquo;s lost item recovery system is almost entirely in
          Korean, most foreigners give up before even trying. That&rsquo;s
          where we come in.
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
  );
}
