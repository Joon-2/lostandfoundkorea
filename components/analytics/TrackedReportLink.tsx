"use client";

import type { ReactNode } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { Link } from "@/i18n/navigation";

// Internal Link that fires a GA4 `report_started` event with a
// caller-supplied location label before navigating. Used for every
// "Start a report" / "Start free" / "Start All-in-One" / "Start
// Delivery" / footer-CTA button so each entry point shows up
// distinctly in GA. The tracking call is fire-and-forget; navigation
// is not awaited or blocked.

type Props = {
  href: string;
  location: string;
  className?: string;
  children: ReactNode;
};

export default function TrackedReportLink({
  href,
  location,
  className,
  children,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        sendGAEvent("event", "report_started", { location });
      }}
    >
      {children}
    </Link>
  );
}
