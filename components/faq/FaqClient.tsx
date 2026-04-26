"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FAQ_CATEGORIES } from "./FaqContent";

// Search-and-accordion FAQ. Multiple items can be open at once. Items
// expand/collapse on click and on direct hash navigation
// (/faq#how-much-does-it-cost). Search filters case-insensitively
// against question text only.

export default function FaqClient() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggle = (id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // On mount + on hashchange: open the matching question and scroll to it.
  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const exists = FAQ_CATEGORIES.some((c) =>
        c.items.some((i) => i.id === id)
      );
      if (!exists) return;
      setOpen((prev) => ({ ...prev, [id]: true }));
      // Defer scroll until after the panel mounts so the offset is right.
      requestAnimationFrame(() => {
        const el = itemRefs.current[id];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

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

  return (
    <div>
      <SearchBox value={query} onChange={setQuery} />

      {totalShown === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-alt px-5 py-8 text-center text-sm text-muted">
          No questions match "{query}". Try a different search.
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {filtered.map((cat) => (
            <section key={cat.title}>
              <h2 className="font-serif text-2xl tracking-tight text-foreground">
                {cat.title}
              </h2>
              <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                {cat.items.map((item) => {
                  const isOpen = !!open[item.id];
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[item.id] = el;
                      }}
                      id={item.id}
                      className="scroll-mt-24"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`${item.id}-panel`}
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-alt sm:px-6"
                      >
                        <span className="text-[15px] font-medium leading-snug text-foreground sm:text-base">
                          {item.q}
                        </span>
                        <ChevronIcon open={isOpen} />
                      </button>
                      {isOpen && (
                        <div
                          id={`${item.id}-panel`}
                          className="px-5 pb-5 sm:px-6 sm:pb-6"
                        >
                          <div className="faq-prose text-[15px] leading-relaxed text-body">
                            {item.a}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

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
        placeholder="Search questions…"
        className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
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
      className={`mt-1 h-4 w-4 flex-shrink-0 text-muted transition-transform ${
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
