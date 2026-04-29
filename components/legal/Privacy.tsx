"use client";

import { useLocale } from "next-intl";
import PrivacyEn from "@/components/legal/Privacy.en";
import PrivacyJa from "@/components/legal/Privacy.ja";

// Per-locale dispatcher. The actual prose lives in Privacy.en.tsx
// and Privacy.ja.tsx; this thin wrapper picks the right one based
// on the active locale.

export default function Privacy() {
  const locale = useLocale();
  return locale === "ja" ? <PrivacyJa /> : <PrivacyEn />;
}
