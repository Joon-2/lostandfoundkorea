"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { plans } from "@/config/plans";
import CaseDetail from "@/components/admin/CaseDetail";
import Pagination from "@/components/admin/Pagination";

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
const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 25];

type Stats = {
  total: number;
  pending: number;
  found: number;
  paid: number;
  revenue: number;
};

function computeStats(reports: any[]): Stats {
  const counts = { total: reports.length, pending: 0, found: 0, paid: 0 };
  for (const r of reports) {
    const s = r.status || "pending";
    if ((counts as any)[s] !== undefined) (counts as any)[s] += 1;
  }
  return { ...counts, revenue: counts.paid * PRICE };
}

export function unreadMessageCount(report: any): number {
  const list: any[] = Array.isArray(report?.messages) ? report.messages : [];
  return list.filter((m) => m && m.from === "customer" && !m.read).length;
}

export function totalUnread(reports: any[]): number {
  return reports.reduce((acc, r) => acc + unreadMessageCount(r), 0);
}

// ─── Stats row ────────────────────────────────────────────────────────────

function StatsRow({ stats }: { stats: Stats }) {
  const items = [
    {
      label: "Total cases",
      value: String(stats.total),
      helper: "All time",
      tone: "default" as const,
    },
    {
      label: "Pending",
      value: String(stats.pending),
      helper: "Awaiting search start",
      tone: "amber" as const,
    },
    {
      label: "Found",
      value: String(stats.found),
      helper: "Awaiting payment",
      tone: "sky" as const,
    },
    {
      label: "Paid",
      value: String(stats.paid),
      helper: "Recovered & paid",
      tone: "emerald" as const,
    },
    {
      label: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      helper:
        stats.paid > 0
          ? `${stats.paid} × $${PRICE}`
          : "Earned when cases pay",
      tone: "emerald" as const,
    },
  ];
  const tone: Record<string, string> = {
    amber: "text-amber-700",
    emerald: "text-accent",
    sky: "text-sky-700",
    default: "text-foreground",
  };
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border bg-card px-4 py-3 shadow-card"
        >
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            {it.label}
          </div>
          <div
            className={`mt-1 font-serif text-2xl tracking-tight ${tone[it.tone]}`}
          >
            {it.value}
          </div>
          <div className="mt-1 text-xs text-muted">{it.helper}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────

type ToolbarProps = {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
};

function Toolbar({
  search,
  onSearch,
  statusFilter,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: ToolbarProps) {
  const compact =
    "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by case number, name, or email"
        className={compact}
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`${compact} sm:w-40`}
      >
        <option value="all">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        aria-label="From date"
        className={`${compact} sm:w-40`}
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        aria-label="To date"
        className={`${compact} sm:w-40`}
      />
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────

type CaseListProps = {
  reports: any[];
  loading: boolean;
  loadError: string | null;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
};

export default function CaseList({
  reports,
  loading,
  loadError,
  password,
  onUnauthorized,
  onUpdate,
}: CaseListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // Collapse any expanded row when paging or resizing — the row may
  // not be on the new page anyway and leaving it expanded creates a
  // disorienting layout shift.
  const goToPage = (next: number) => {
    setExpandedId(null);
    setPage(next);
  };
  const changePageSize = (next: number) => {
    setExpandedId(null);
    setPageSize(next);
    setPage(1);
  };

  // Auto-expand the case named in ?case=LFK-XXXXXX (used by admin
  // notification emails) once reports have loaded.
  useEffect(() => {
    if (typeof window === "undefined" || reports.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("case");
    if (!requested) return;
    const match = reports.find((r) => r.case_number === requested);
    if (match) setExpandedId((current) => current ?? match.id);
  }, [reports]);

  const stats = useMemo(() => computeStats(reports), [reports]);

  const filtered = useMemo(() => {
    let arr = reports;
    if (statusFilter !== "all") {
      arr = arr.filter((r) => (r.status || "pending") === statusFilter);
    }
    if (dateFrom) {
      const cutoff = new Date(dateFrom).getTime();
      arr = arr.filter((r) => {
        const t = r.created_at ? Date.parse(r.created_at) : 0;
        return t >= cutoff;
      });
    }
    if (dateTo) {
      const cutoff = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
      arr = arr.filter((r) => {
        const t = r.created_at ? Date.parse(r.created_at) : 0;
        return t <= cutoff;
      });
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
  }, [reports, search, statusFilter, dateFrom, dateTo]);

  // Reset to page 1 whenever the filter set changes.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <>
      <header className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Reports
        </h1>
        <p className="mt-1 text-sm text-muted">
          Every case, in one place. Click a row to open the full editor.
        </p>
      </header>

      <StatsRow stats={stats} />

      <div className="mt-6">
        <Toolbar
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />
      </div>

      {loadError && (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-alt text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Case</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && reports.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    Loading cases…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && reports.length > 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No cases match the current filter.
                  </td>
                </tr>
              )}
              {!loading && reports.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No reports yet.
                  </td>
                </tr>
              )}
              {visible.map((r) => (
                <Row
                  key={r.id}
                  report={r}
                  expanded={expandedId === r.id}
                  onToggle={() =>
                    setExpandedId(expandedId === r.id ? null : r.id)
                  }
                  password={password}
                  onUnauthorized={onUnauthorized}
                  onUpdate={onUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      </div>
    </>
  );
}

function Row({
  report,
  expanded,
  onToggle,
  password,
  onUnauthorized,
  onUpdate,
}: {
  report: any;
  expanded: boolean;
  onToggle: () => void;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (r: any) => void;
}) {
  const status = report.status || "pending";
  const unread = unreadMessageCount(report);
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-border transition-colors hover:bg-alt/60 ${
          expanded ? "bg-alt/40" : ""
        }`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span
                aria-label={`${unread} unread`}
                className="inline-flex h-2 w-2 flex-none rounded-full bg-accent"
              />
            )}
            <span className="font-mono text-sm font-semibold text-foreground">
              {report.case_number || "—"}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-foreground">
          {report.name || <span className="text-muted/60">—</span>}
        </td>
        <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">
          {report.email || <span className="text-muted/60">—</span>}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </td>
        <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">
          {formatDate(report.date_lost) || "—"}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-card">
          <td colSpan={5} className="p-0">
            <CaseDetail
              report={report}
              password={password}
              onUnauthorized={onUnauthorized}
              onUpdate={onUpdate}
            />
          </td>
        </tr>
      )}
    </>
  );
}

