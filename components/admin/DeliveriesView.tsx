"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import {
  PHASE2_STAGES,
  isDeliveryRequired,
  normalizeStageKey,
} from "@/lib/process-stages";
import DeliveryDetail from "@/components/admin/DeliveryDetail";

// Case-centric Deliveries view. Shows every delivery-required case
// from `paid` onward and lets the admin click into any one to see
// (and drive) its phase-2 stepper.
//
// State is lifted from admin/page.tsx so refreshes from the top bar
// flow into both this view and the Reports view.

const PHASE2_KEYS = new Set<string>(PHASE2_STAGES.map((s: any) => s.key));
const PAGE_SIZE = 20;

const STAGE_LABELS: Record<string, string> = {
  paid: "Awaiting pickup",
  pickup_scheduled: "Pickup scheduled",
  picked_up: "Picked up",
  shipping_quote: "Shipping quote",
  quote_accepted: "Quote accepted",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
};

const STAGE_BADGE: Record<string, string> = {
  paid: "bg-amber-50 text-amber-700 border-amber-200",
  pickup_scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  picked_up: "bg-sky-50 text-sky-700 border-sky-200",
  shipping_quote: "bg-sky-50 text-sky-700 border-sky-200",
  quote_accepted: "bg-sky-50 text-sky-700 border-sky-200",
  shipped: "bg-sky-50 text-sky-700 border-sky-200",
  delivered: "bg-emerald-50 text-accent border-emerald-200",
  completed: "bg-emerald-50 text-accent border-emerald-200",
};

type DeliveriesViewProps = {
  reports: any[];
  loading: boolean;
  loadError: string | null;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
};

export default function DeliveriesView({
  reports,
  loading,
  loadError,
  password,
  onUnauthorized,
  onUpdate,
}: DeliveriesViewProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Cases are delivery-required AND past payment.
  const deliveryCases = useMemo(() => {
    return reports.filter((r) => {
      if (!isDeliveryRequired(r)) return false;
      const stage = normalizeStageKey(r.process_stage);
      return stage === "paid" || PHASE2_KEYS.has(stage);
    });
  }, [reports]);

  // Auto-expand the case named in ?case=LFK-XXXXXX. Used by the
  // "View delivery →" link in CaseDetail.
  useEffect(() => {
    if (typeof window === "undefined" || deliveryCases.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("case");
    if (!requested) return;
    const match = deliveryCases.find((r) => r.case_number === requested);
    if (match) setExpandedId((current) => current ?? match.id);
  }, [deliveryCases]);

  const stats = useMemo(() => {
    let awaitingPickup = 0;
    let inProgress = 0;
    let delivered = 0;
    let completed = 0;
    for (const r of deliveryCases) {
      const stage = normalizeStageKey(r.process_stage);
      if (stage === "paid") awaitingPickup += 1;
      else if (stage === "completed") completed += 1;
      else if (stage === "delivered") delivered += 1;
      else inProgress += 1;
    }
    return { awaitingPickup, inProgress, delivered, completed };
  }, [deliveryCases]);

  const filtered = useMemo(() => {
    let arr = deliveryCases;
    if (stageFilter !== "all") {
      arr = arr.filter(
        (r) => normalizeStageKey(r.process_stage) === stageFilter
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (r) =>
          (r.case_number || "").toLowerCase().includes(q) ||
          (r.name || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q) ||
          (r.tracking_number || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [deliveryCases, search, stageFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, stageFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const compact =
    "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <>
      <header className="mb-6">
        <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Deliveries
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pickup, ship, and deliver paid cases. Click a row to drive the
          stepper.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Awaiting pickup"
          value={stats.awaitingPickup}
          tone="amber"
          helper="Paid; ready to schedule"
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          tone="sky"
          helper="Pickup → ship pipeline"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          tone="emerald"
          helper="Awaiting case close"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          tone="emerald"
          helper="Closed and done"
        />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case number, name, email, or tracking"
          className={compact}
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className={`${compact} sm:w-48`}
        >
          <option value="all">All stages</option>
          {Object.entries(STAGE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
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
                  Stage
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Tracking
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && deliveryCases.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && deliveryCases.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No cases need delivery yet. Cases show up here once
                    they&rsquo;re paid and require shipping.
                  </td>
                </tr>
              )}
              {!loading &&
                deliveryCases.length > 0 &&
                filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-muted"
                    >
                      No cases match the current filter.
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
          pageCount={pageCount}
          total={filtered.length}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
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
  const stage = normalizeStageKey(report.process_stage);
  const stageLabel = STAGE_LABELS[stage] || stage;
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-border transition-colors hover:bg-alt/60 ${
          expanded ? "bg-alt/40" : ""
        }`}
      >
        <td className="px-4 py-3">
          <span className="font-mono text-sm font-semibold text-foreground">
            {report.case_number || "—"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-foreground">
          {report.name || <span className="text-muted/60">—</span>}
          {report.email && (
            <div className="text-xs text-muted">{report.email}</div>
          )}
        </td>
        <td className="hidden px-4 py-3 sm:table-cell">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STAGE_BADGE[stage] || ""}`}
          >
            {stageLabel}
          </span>
        </td>
        <td className="hidden px-4 py-3 font-mono text-xs text-body md:table-cell">
          {report.tracking_number || (
            <span className="text-muted/60">—</span>
          )}
        </td>
        <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">
          {formatDate(report.date_lost) || "—"}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-card">
          <td colSpan={5} className="p-0">
            <DeliveryDetail
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

function Pagination({
  page,
  pageCount,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (total <= PAGE_SIZE) return null;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(total, page * PAGE_SIZE);
  return (
    <div className="flex items-center justify-between border-t border-border bg-alt px-4 py-3 text-sm">
      <span className="text-muted">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-alt disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Prev
        </button>
        <span className="text-xs text-muted">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= pageCount}
          className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-alt disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: number;
  tone: "amber" | "sky" | "emerald" | "red";
  helper?: string;
}) {
  const tonal: Record<typeof tone, string> = {
    amber: "text-amber-700",
    sky: "text-sky-700",
    emerald: "text-accent",
    red: "text-red-700",
  };
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </div>
      <div className={`mt-1 font-serif text-2xl tracking-tight ${tonal[tone]}`}>
        {value}
      </div>
      {helper && <div className="mt-1 text-xs text-muted">{helper}</div>}
    </div>
  );
}
