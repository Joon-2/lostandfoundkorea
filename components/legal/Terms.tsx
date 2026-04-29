"use client";

import { useLocale } from "next-intl";
import TermsEn from "@/components/legal/Terms.en";
import TermsJa from "@/components/legal/Terms.ja";

// Per-locale dispatcher. The actual prose lives in Terms.en.tsx and
// Terms.ja.tsx; this thin wrapper picks the right one based on the
// active locale. LegalTabs imports `Terms` (this file) — the split
// is invisible from the outside.

export default function Terms() {
  const locale = useLocale();
  return locale === "ja" ? <TermsJa /> : <TermsEn />;
}
