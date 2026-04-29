"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// Five-tab founding-narrative layout. Sticky left nav on desktop,
// horizontal scroll tabs on mobile. Active tab syncs to the URL hash
// so each section is shareable (e.g. /our-story#what-changed).
//
// Tab labels and body paragraphs come from /locales/<locale>.json
// under ourStory.tabs[]; the order and IDs here must mirror that
// array exactly.

type TabKey =
  | "what-we-saw"
  | "why-items-dont-make-it-home"
  | "what-changed"
  | "how-lfk-started"
  | "our-vision";

const TABS: { key: TabKey }[] = [
  { key: "what-we-saw" },
  { key: "why-items-dont-make-it-home" },
  { key: "what-changed" },
  { key: "how-lfk-started" },
  { key: "our-vision" },
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

// Resolves the tab index for the current TabKey. Used to look up
// label and paragraphs from the translations array, since t.raw
// returns ourStory.tabs[] in the same order as TABS.
function indexFor(key: TabKey): number {
  return KEYS.indexOf(key);
}

export default function StoryTabs() {
  const t = useTranslations("ourStory");
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

  const labelOf = (key: TabKey) => t(`tabs.${indexFor(key)}.label`);

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
              {labelOf(tab.key)}
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
            {t("tabsNavLabel")}
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
                {labelOf(tab.key)}
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
          <TabBody tabKey={active} />
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

// ─── Tab body (data-driven) ─────────────────────────────────────────────

function TabBody({ tabKey }: { tabKey: TabKey }) {
  const t = useTranslations("ourStory");
  const i = indexFor(tabKey);
  const label = t(`tabs.${i}.label`);
  const paragraphs = t.raw(`tabs.${i}.paragraphs`) as string[];
  return (
    <section>
      <H1>{label}</H1>
      {paragraphs.map((para, j) => (
        <P key={j}>{para}</P>
      ))}
    </section>
  );
}
