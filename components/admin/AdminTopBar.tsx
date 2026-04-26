"use client";

import Link from "next/link";

type AdminTopBarProps = {
  section: string;
  page: string;
  onMobileMenuOpen: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  showActions?: boolean;
  showNewReport?: boolean;
  newReportHref?: string;
};

// Sticky top bar for the admin shell. Left: hamburger (mobile) +
// breadcrumb. Right: optional Refresh / Export / New Report buttons —
// hidden on sections that don't have them yet.
export default function AdminTopBar({
  section,
  page,
  onMobileMenuOpen,
  refreshing,
  onRefresh,
  onExport,
  showActions = true,
  showNewReport = true,
  newReportHref = "/report",
}: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-border bg-card px-5 sm:px-8">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMobileMenuOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-alt md:hidden"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </svg>
      </button>

      <nav
        aria-label="Breadcrumb"
        className="flex flex-1 items-center text-sm"
      >
        <span className="text-muted">{section}</span>
        <span aria-hidden="true" className="mx-2 text-muted/60">
          /
        </span>
        <span className="font-medium text-foreground">{page}</span>
      </nav>

      {showActions && (
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
            >
              <RefreshIcon spinning={Boolean(refreshing)} />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing…" : "Refresh"}
              </span>
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-alt sm:inline-flex"
            >
              <DownloadIcon />
              Export
            </button>
          )}
          {showNewReport && (
            <Link
              href={newReportHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <PlusIcon />
              <span className="hidden sm:inline">New report</span>
              <span className="sm:hidden">New</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
