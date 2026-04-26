"use client";

import { useEffect, useState } from "react";

// Five-tab founding-narrative layout. Sticky left nav on desktop,
// horizontal scroll tabs on mobile. Active tab syncs to the URL hash
// so each section is shareable (e.g. /our-story#what-changed).

type TabKey =
  | "what-we-saw"
  | "why-items-dont-make-it-home"
  | "what-changed"
  | "how-lfk-started"
  | "our-vision";

const TABS: { key: TabKey; label: string }[] = [
  { key: "what-we-saw", label: "What we saw" },
  { key: "why-items-dont-make-it-home", label: "Why items don't make it home" },
  { key: "what-changed", label: "What changed" },
  { key: "how-lfk-started", label: "How LFK started" },
  { key: "our-vision", label: "Our vision" },
];

const KEYS = TABS.map((t) => t.key);
const DEFAULT_TAB: TabKey = "what-we-saw";

function isTabKey(v: string | null | undefined): v is TabKey {
  return !!v && (KEYS as string[]).includes(v);
}

function readHash(): TabKey {
  if (typeof window === "undefined") return DEFAULT_TAB;
  const h = window.location.hash.replace(/^#/, "");
  return isTabKey(h) ? h : DEFAULT_TAB;
}

export default function StoryTabs() {
  const [active, setActive] = useState<TabKey>(DEFAULT_TAB);
  // Drives the fade-in animation on tab change. Bumped on every switch
  // so React re-runs the keyed mount.
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setActive(readHash());
    setRenderKey((k) => k + 1);
    const onHash = () => {
      setActive(readHash());
      setRenderKey((k) => k + 1);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const switchTab = (key: TabKey) => {
    if (key === active) return;
    setActive(key);
    setRenderKey((k) => k + 1);
    // replaceState so the hash updates without a navigation entry per
    // click and without the browser scrolling to the anchor.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${key}`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[260px_1fr] md:gap-16">
      {/* Mobile: horizontal scroll tabs */}
      <nav
        role="tablist"
        aria-label="Our Story sections"
        className="-mx-5 flex gap-1 overflow-x-auto border-b border-border px-5 md:hidden"
      >
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => switchTab(tab.key)}
              className={`relative -mb-px whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Desktop: sticky vertical nav */}
      <aside className="hidden md:block">
        <nav
          role="tablist"
          aria-label="Our Story sections"
          className="sticky top-[88px] flex flex-col gap-1"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            Our Story
          </p>
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => switchTab(tab.key)}
                className={`group flex items-start gap-3 rounded-r-md border-l-2 py-2 pl-3 pr-2 text-left text-[15px] leading-snug transition-colors ${
                  isActive
                    ? "border-accent bg-alt font-semibold text-foreground"
                    : "border-transparent text-body hover:border-border hover:bg-alt hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <article className="min-w-0">
        <div
          key={renderKey}
          className="mx-auto max-w-[640px] animate-[storyFade_240ms_ease-out_both]"
        >
          {active === "what-we-saw" && <WhatWeSaw />}
          {active === "why-items-dont-make-it-home" && <WhyItemsDontMakeItHome />}
          {active === "what-changed" && <WhatChanged />}
          {active === "how-lfk-started" && <HowLfkStarted />}
          {active === "our-vision" && <OurVision />}
        </div>
      </article>

      <style jsx global>{`
        @keyframes storyFade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Typographic primitives (scoped to this page) ───────────────────────

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
      {children}
    </h1>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 text-[17px] leading-[1.75] text-body">{children}</p>
  );
}

// ─── Tab bodies ─────────────────────────────────────────────────────────

function WhatWeSaw() {
  return (
    <section>
      <H1>What we saw</H1>
      <P>
        Anyone who spends time around hotels or airports eventually notices a
        quiet scene that repeats itself: someone's suitcase, someone's wallet,
        someone's passport sitting in a corner behind the counter, waiting for
        days, weeks, sometimes months.
      </P>
      <P>
        For a long time, I walked past these things without thinking much
        about them. But over time, those objects started to look different to
        me.
      </P>
      <P>
        Some of the bags were clearly expensive — items someone had hesitated
        over for a long time before finally purchasing, things they had taken
        care of carefully. Some of the wallets contained credit cards
        alongside a small photograph of a child. Some of the laptops likely
        held the entirety of someone's work and personal life.
      </P>
      <P>
        But what weighed on me most were the items whose value couldn't be
        measured in money. Old journals. Small boxes holding handwritten
        letters. Cameras filled with photos from an entire trip. Wristwatches
        that looked as though they'd been passed down from a parent or
        grandparent. Things that couldn't be replaced. Things that held time
        that couldn't be remade.
      </P>
      <P>
        Every time I noticed those items still sitting in the same spot weeks
        or months later, something in me felt heavy. Someone, somewhere, was
        probably still looking for that thing. Or had already given up and was
        learning to live with the empty space where it used to be.
      </P>
      <P>
        That's where the question started. Why are these items not making it
        back to their owners? The facilities are clearly storing them well —
        so what is missing?
      </P>
    </section>
  );
}

function WhyItemsDontMakeItHome() {
  return (
    <section>
      <H1>Why items don't make it home</H1>
      <P>
        Following the question led to an answer, and the answer turned out to
        be no one's fault.
      </P>
      <P>
        Hotels, airports, airlines, transit systems — these institutions take
        their responsibility for lost items seriously. In Korea especially,
        they take it remarkably seriously. Items are stored well. Records are
        kept carefully. Up to that point, the system is excellent.
      </P>
      <P>
        The problem begins at the next step: actually returning the item to
        its owner.
      </P>
      <P>
        That part of the work is, by its nature, almost entirely human.
        Someone has to call the facility in Korean. Someone has to communicate
        with a customer in another time zone, in their language. Someone has
        to confirm exactly how the customer wants the item handled — opened
        or sealed, packaged how, insured for what value. Someone has to
        coordinate international shipping. Someone has to prepare customs
        paperwork. Someone has to follow up after the item is sent. Each case
        is its own small project.
      </P>
      <P>
        Here is where the structural problem becomes visible: the more
        actively a facility tries to do this work, the deeper the loss they
        take on. Storage space is occupied. Staff time is consumed.
        Multilingual support is needed. Resources have to be invested in
        international shipping and customs work that has nothing to do with
        their core business. All of it costs money.
      </P>
      <P>
        And who covers that cost? No one. There is no revenue in this work.
        Facilities don't have a way to make money from returning lost items.
        The harder they try, the more they lose, with no way to recover any
        of it.
      </P>
      <P>
        If this work could generate revenue, airlines and hotels and
        government agencies would have built better systems for it long ago.
        But it can't. It's a cost center, not a business line. So every
        facility, very rationally, stops halfway. They store the item. They
        keep the record. But the final step — getting the item back to its
        owner — is no one's job.
      </P>
      <P>
        This isn't a Korea-specific problem. The same is true in Japan, in
        Germany, in the United States. Lost-and-found has always been a "cost
        to be tolerated" rather than "an investment to be made." The economics
        never worked anywhere.
      </P>
    </section>
  );
}

function WhatChanged() {
  return (
    <section>
      <H1>What changed</H1>
      <P>
        The work of returning a lost item to its owner is, in its core,
        almost entirely human work — work of language and judgment.
      </P>
      <P>
        Politely persuading a hotel staffer to check the lost-and-found bin
        one more time. Translating a customer's anxious description into
        Korean polite enough that a Korean staff member will actually pull
        the records. The endless back-and-forth with a customer in another
        time zone about whether to open the bag, how to package it, which
        insurance to add. Knowing when to push a facility for a faster
        response. Knowing when to back off.
      </P>
      <P>
        Each case is its own negotiation, its own piece of correspondence,
        its own chain of small decisions. None of it can be automated.
      </P>
      <P>
        To run this as a business meant hiring multilingual staff, training
        them in Korean institutional culture, paying their salaries, and
        somehow making the math work on small service fees. The labor costs
        eat the margin alive. That's why no one had built it. Not because
        the gap was invisible. Because the unit economics didn't work.
      </P>
      <P>
        The leap in AI tools over the last year or two changed that math.
      </P>
      <P>
        We don't want to be misunderstood. AI is not replacing human judgment
        here. The careful work of deciding whether to open a customer's bag,
        how to phrase a difficult conversation, when to push a facility, when
        to hold back — that remains entirely human. It has to be.
      </P>
      <P>
        But the work surrounding that judgment — accurate translation between
        two languages, drafting bilingual correspondence, organizing customs
        paperwork, building and maintaining the technical systems that hold
        this all together, organizing and searching case histories — all of
        that is now within reach for a small team with the right tools. Work
        that would have required five or six people five years ago can now be
        handled by a far smaller group.
      </P>
      <P>
        That changed the unit economics. Labor stopped eating the entire
        margin. Suddenly this work could exist as a real business and not
        just as goodwill or a side project.
      </P>
    </section>
  );
}

function HowLfkStarted() {
  return (
    <section>
      <H1>How LFK started</H1>
      <P>So we started.</P>
      <P>
        Lost &amp; Found Korea focuses on one thing: returning items lost in
        Korea to their owners abroad. We don't try to do everything. We don't
        try to replace the careful work the facility staff already do. We
        simply handle the part the facility was never resourced to handle —
        the final mile.
      </P>
      <P>
        We contact the facility in Korean. We retrieve the item ourselves. We
        package it carefully. We follow the customer's wishes exactly — if
        they ask us not to open the bag, we don't. If they want insurance,
        we add it. We ship it to wherever they are in the world. We update
        them in their language at every step.
      </P>
      <P>
        We charge a clear, transparent fee. Third-party costs are disclosed
        in advance. There are no hidden charges. Because we're a registered
        business in Korea, we can offer something that informal helpers
        cannot: accountability. Insurance, tracking, a clear refund policy,
        the kind of standing-behind-the-work that gives a stranger in another
        country a reason to trust us with something they care about.
      </P>
      <P>
        We're a small operation. We keep it small on purpose. Our focus is
        deep, not wide: international travelers who have lost something in
        Korea, and the careful work of getting that something home.
      </P>
    </section>
  );
}

function OurVision() {
  return (
    <section>
      <H1>Our vision</H1>
      <P>
        There is a gap in the world. A gap that isn't anyone's fault — a gap
        that exists for structural reasons. Facilities handle storage.
        Governments fulfill their share of responsibility. But the final step
        — returning the item to its owner — has always been left empty.
      </P>
      <P>Lost &amp; Found Korea exists to close that gap.</P>
      <P>
        Our vision goes beyond Korea. We believe that meaningful belongings —
        the ones carrying memories, history, and parts of someone's life —
        should not be wasted, forgotten, or thrown away simply because the
        system wasn't built to send them home. They deserve to find their way
        back to the people they belong to.
      </P>
      <P>
        We're starting in Korea, but the same structural gap exists almost
        everywhere. Facilities store. Governments oversee. But returning
        items to their owners has been no one's job, anywhere. Someday, we
        hope to close that gap far beyond Korea — so that no matter where in
        the world an item is lost, there is a trustworthy way home for it.
      </P>
      <P>
        If you're reading this, having lost something in Korea while being
        somewhere else in the world, we just want you to know: there's a way
        to get it home. The system has a gap. We're here to close it.
      </P>
    </section>
  );
}
