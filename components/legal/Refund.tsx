"use client";

import { useLocale } from "next-intl";
import RefundEn from "@/components/legal/Refund.en";
import RefundJa from "@/components/legal/Refund.ja";

// Per-locale dispatcher. The actual prose lives in Refund.en.tsx
// and Refund.ja.tsx; this thin wrapper picks the right one based
// on the active locale.

export default function Refund() {
  const locale = useLocale();
  return locale === "ja" ? <RefundJa /> : <RefundEn />;
}
