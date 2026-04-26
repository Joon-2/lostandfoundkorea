"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FAQ_CATEGORIES } from "./FaqContent";

// Two-column FAQ. Left rail is a sticky category nav with active-section
// tracking via IntersectionObserver. Right column has a compact search
// box at the top and the categorized accordion below.
//
// Per item:
//   - all collapsed by default; multiple can be open at once
//   - smooth expand via grid-template-rows trick (no JS height math)
//   - hash anchors (/faq#how-much-does-it-cost) auto-open + scroll
//
// Search filters question text only and reports a count under the input.

const HEADER_OFFSET = 88; // sticky site header (60px) + breathing room

export default function FaqClient() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>(
    FAQ_CATEGORIES[0].id
  );

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const toggle = (id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Hash → open + scroll. Runs on mount and on hashchange (back/forward,
  // pasted link).
  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const exists = FAQ_CATEGORIES.some((c) =>
        c.items.some((i) => i.id === id)
      );
      if (!exists) return;
      setOpen((prev) => ({ ...prev, [id]: true }));
      requestAnimationFrame(() => {
        const el = itemRefs.current[id];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  // Active-category tracking: highlight whichever section's header is
  // closest to the top of the viewport (just below the sticky header).
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Use the topmost intersecting entry. Falls back to whatever
        // entry is currently intersecting if multiple do.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveCategory(visible[0].target.id.replace(/^cat-/, ""));
        }
      },
      {
        rootMargin: `-${HEADER_OFFSET + 8}px 0px -55% 0px`,
        threshold: 0,
      }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(id);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((i) =>
        i.q.toLowerCase().includes(normalizedQuery)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [normalizedQuery]);

  const totalShown = filtered.reduce((n, c) => n + c.items.length, 0);
  const isSearching = normalizedQuery.length > 0;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr] md:gap-12 lg:gap-16">
      {/* Mobile: horizontal-scroll category nav */}
      <nav
        aria-label="FAQ categories"
        className="-mx-5 flex gap-1 overflow-x-auto border-b border-border px-5 md:hidden"
      >
        {FAQ_CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategory(cat.id)}
              className={`relative -mb-px whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {cat.title}
            </button>
          );
        })}
      </nav>

      {/* Desktop: sticky vertical nav */}
      <aside className="hidden md:block">
        <nav
          aria-label="FAQ categories"
          className="sticky top-[88px] flex flex-col gap-1"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            Categories
          </p>
          {FAQ_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToCategory(cat.id)}
                className={`group flex flex-col items-start gap-0.5 rounded-r-md border-l-2 py-2 pl-3 pr-2 text-left text-[14px] leading-snug transition-colors ${
                  isActive
                    ? "border-accent bg-alt font-semibold text-foreground"
                    : "border-transparent text-body hover:border-border hover:bg-alt hover:text-foreground"
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        {/* Search */}
        <div className="mb-2 max-w-md">
          <SearchBox value={query} onChange={setQuery} />
        </div>
        <p
          className="mb-8 text-xs text-muted"
          aria-live="polite"
          role="status"
        >
          {isSearching
            ? totalShown === 0
              ? "No results found"
              : `${totalShown} ${totalShown === 1 ? "result" : "results"}`
            : " "}
        </p>

        {totalShown === 0 ? (
          <div className="rounded-xl border border-border bg-alt px-5 py-8 text-center text-sm text-muted">
            No questions match "{query}". Try a different search.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((cat, catIdx) => (
              <section
                key={cat.id}
                id={`cat-${cat.id}`}
                ref={(el) => {
                  sectionRefs.current[cat.id] = el;
                }}
                className={`scroll-mt-24 ${catIdx === 0 ? "pb-10" : "py-10"}`}
              >
                <CategoryHeader
                  index={
                    // Keep canonical numbering (01..05) even when search
                    // hides categories.
                    FAQ_CATEGORIES.findIndex((c) => c.id === cat.id) + 1
                  }
                  title={cat.title}
                  description={cat.description}
                />

                <div className="mt-5 space-y-2">
                  {cat.items.map((item) => {
                    const isOpen = !!open[item.id];
                    return (
                      <div
                        key={item.id}
                        ref={(el) => {
                          itemRefs.current[item.id] = el;
                        }}
                        id={item.id}
                        className={`scroll-mt-24 rounded-xl border transition-colors ${
                          isOpen
                            ? "border-accent/30 bg-alt"
                            : "border-border bg-card hover:border-border"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          aria-expanded={isOpen}
                          aria-controls={`${item.id}-panel`}
                          className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left sm:px-5"
                        >
                          <span
                            className={`text-[15px] leading-snug ${
                              isOpen
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground"
                            }`}
                          >
                            {item.q}
                          </span>
                          <ChevronIcon open={isOpen} />
                        </button>
                        <div
                          id={`${item.id}-panel`}
                          className="grid transition-[grid-template-rows] duration-200 ease-out"
                          style={{
                            gridTemplateRows: isOpen ? "1fr" : "0fr",
                          }}
                          aria-hidden={!isOpen}
                        >
                          <div className="overflow-hidden">
                            <div className="faq-prose px-4 pb-4 text-[15px] leading-relaxed text-body sm:px-5 sm:pb-5">
                              {item.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .faq-prose p + p,
        .faq-prose p + ul,
        .faq-prose ul + p {
          margin-top: 0.85rem;
        }
        .faq-prose ul {
          list-style: disc;
          padding-left: 1.4rem;
        }
        .faq-prose ul li + li {
          margin-top: 0.4rem;
        }
        .faq-prose ul li::marker {
          color: var(--muted);
        }
        .faq-prose strong {
          color: var(--foreground);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function CategoryHeader({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  const num = String(index).padStart(2, "0");
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-1 inline-flex h-6 min-w-[28px] items-center justify-center rounded-md bg-accent/10 px-1.5 text-[11px] font-semibold tracking-wider text-accent"
      >
        {num}
      </span>
      <div>
        <h2 className="font-serif text-2xl tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search questions</span>
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search questions"
        className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`mt-1 h-4 w-4 flex-shrink-0 text-muted transition-transform duration-200 ease-out ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
