"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Terms from "@/components/legal/Terms";
import Privacy from "@/components/legal/Privacy";
import Refund from "@/components/legal/Refund";

const TABS = [
  { key: "terms", label: "Terms of Service", Component: Terms },
  { key: "privacy", label: "Privacy Policy", Component: Privacy },
  { key: "refund", label: "Refund Policy", Component: Refund },
] as const;

type TabKey = (typeof TABS)[number]["key"];
const DEFAULT_TAB: TabKey = "terms";

function isTabKey(v: string | null): v is TabKey {
  return v === "terms" || v === "privacy" || v === "refund";
}

export default function LegalTabs() {
  return (
    <Suspense fallback={<TabsFallback />}>
      <Inner />
    </Suspense>
  );
}

function TabsFallback() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-alt px-4 py-6 text-sm text-muted">
      Loading…
    </div>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const fromUrl = params.get("tab");
  const initial: TabKey = isTabKey(fromUrl) ? fromUrl : DEFAULT_TAB;
  const [active, setActive] = useState<TabKey>(initial);

  // Sync state when the URL changes externally (back/forward, paste).
  useEffect(() => {
    if (isTabKey(fromUrl) && fromUrl !== active) {
      setActive(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromUrl]);

  const switchTab = (key: TabKey) => {
    setActive(key);
    // scroll: false → in-place tab swap, no jump.
    router.replace(`/legal?tab=${key}`, { scroll: false });
  };

  const Active = TABS.find((t) => t.key === active)!.Component;

  return (
    <>
      <div
        role="tablist"
        aria-label="Legal documents"
        className="-mx-5 mb-8 flex gap-1 overflow-x-auto border-b border-border px-5 sm:mx-0 sm:px-0"
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
              className={`relative -mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <Active />
    </>
  );
}
