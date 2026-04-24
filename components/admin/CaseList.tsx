"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { plans } from "@/config/plans";
import CaseDetail from "@/components/admin/CaseDetail";

const STATUS_OPTIONS = ["pending", "found", "paid", "closed"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  found: "Found",
  paid: "Paid",
  closed: "Closed",
};
const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  found: "bg-sky-50 text-sky-700 border-sky-200",
  paid: "bg-emerald-50 text-accent border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const PRICE = plans.recovery.paymentPrice;

type Stats = {
  total: number;
  pending: number;
  found: number;
  paid: number;
  revenue: number;
};

function StatsRow({ stats }: { stats: Stats }) {
  const items: { label: string; value: string | number; tone?: string }[] = [
    { label: "Total cases", value: stats.total },
    { label: "Pending", value: stats.pending, tone: "amber" },
    { label: "Found", value: stats.found, tone: "sky" },
    { label: "Paid", value: stats.paid, tone: "emerald" },
    {
      label: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      tone: "emerald",
    },
  ];
  const toneColor: Record<string, string> = {
    amber: "text-amber-700",
    emerald: "text-accent",
    sky: "text-sky-700",
  };
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm"
        >
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted">
            {it.label}
          </div>
          <div
            className={`mt-0.5 font-serif text-xl tracking-tight ${
              (it.tone && toneColor[it.tone]) || "text-foreground"
            }`}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

type SearchBarProps = {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
};

function SearchBar({ search, onSearch, statusFilter, onStatusChange }: SearchBarProps) {
  const compact =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by case number, name, or email"
        className={compact + " sm:flex-1"}
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={compact + " sm:w-44"}
      >
        <option value="all">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

type ReportCardProps = {
  report: any;
  expanded: boolean;
  onToggle: () => void;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
};

function ReportCard({
  report,
  expanded,
  onToggle,
  password,
  onUnauthorized,
  onUpdate,
}: ReportCardProps) {
  const status = report.status || "pending";
  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-left"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-sm font-semibold text-foreground">
            {report.case_number || "—"}
          </span>
          <span className="text-sm text-foreground">{report.name}</span>
          <span className="text-xs text-muted">{report.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
          <span className="hidden text-xs text-muted sm:inline">
            {formatDate(report.date_lost) || "—"}
          </span>
          <svg
            className={`h-4 w-4 text-muted transition-transform ${
              expanded ? "rotate-180" : ""
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
        </div>
      </button>
      {expanded && (
        <CaseDetail
          report={report}
          password={password}
          onUnauthorized={onUnauthorized}
          onUpdate={onUpdate}
        />
      )}
    </article>
  );
}

type CaseListProps = {
  password: string;
  onUnauthorized?: () => void;
};

export default function CaseList({ password, onUnauthorized }: CaseListProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to load reports");
      }
      const json = await res.json();
      console.log(
        "[fetchReports] received",
        (json.reports || []).length,
        "reports. found_images summary:",
        (json.reports || []).map((r: any) => ({
          case_number: r.case_number,
          found_images: Array.isArray(r.found_images)
            ? r.found_images.length
            : typeof r.found_images,
        }))
      );
      setReports(json.reports || []);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password, onUnauthorized]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const stats = useMemo<Stats>(() => {
    const counts = { total: reports.length, pending: 0, found: 0, paid: 0 };
    for (const r of reports) {
      const s = r.status || "pending";
      if ((counts as any)[s] !== undefined) (counts as any)[s] += 1;
    }
    return { ...counts, revenue: counts.paid * PRICE };
  }, [reports]);

  const filtered = useMemo(() => {
    let arr = reports;
    if (statusFilter !== "all") {
      arr = arr.filter((r) => (r.status || "pending") === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (r) =>
          (r.case_number || "").toLowerCase().includes(q) ||
          (r.name || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [reports, search, statusFilter]);

  const updateReport = useCallback((updated: any) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">
          Reports
        </h1>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <StatsRow stats={stats} />

      <SearchBar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {loadError && (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {filtered.length === 0 && !loading && (
          <p className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted">
            No reports match the current filter.
          </p>
        )}
        {filtered.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            expanded={expandedId === r.id}
            onToggle={() =>
              setExpandedId(expandedId === r.id ? null : r.id)
            }
            password={password}
            onUnauthorized={onUnauthorized}
            onUpdate={updateReport}
          />
        ))}
      </div>
    </>
  );
}
