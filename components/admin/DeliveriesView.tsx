"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  DELIVERY_STATUSES,
  DELIVERY_STATUS_BADGE,
  DELIVERY_STATUS_LABELS,
  type DeliveryStatus,
  type DeliveryWithReport,
} from "@/types/delivery";
import DeliveryForm from "@/components/admin/DeliveryForm";

type DeliveriesViewProps = {
  password: string;
  onUnauthorized?: () => void;
};

const compactInput =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export default function DeliveriesView({
  password,
  onUnauthorized,
}: DeliveriesViewProps) {
  const [deliveries, setDeliveries] = useState<DeliveryWithReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editing, setEditing] = useState<DeliveryWithReport | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/deliveries", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to load deliveries");
      }
      setDeliveries(json.deliveries || []);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password, onUnauthorized]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Distinct carrier values for the filter dropdown.
  const carriers = useMemo(() => {
    const set = new Set<string>();
    for (const d of deliveries) {
      if (d.carrier && d.carrier.trim()) set.add(d.carrier.trim());
    }
    return Array.from(set).sort();
  }, [deliveries]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tStart = today.getTime();
    let pending = 0;
    let inTransit = 0;
    let deliveredToday = 0;
    let failed = 0;
    for (const d of deliveries) {
      switch (d.status) {
        case "pending":
          pending += 1;
          break;
        case "shipped":
        case "in_transit":
          inTransit += 1;
          break;
        case "delivered": {
          if (
            d.delivered_at &&
            new Date(d.delivered_at).getTime() >= tStart
          ) {
            deliveredToday += 1;
          }
          break;
        }
        case "failed":
          failed += 1;
          break;
      }
    }
    return { pending, inTransit, deliveredToday, failed };
  }, [deliveries]);

  const filtered = useMemo(() => {
    let arr = deliveries;
    if (statusFilter !== "all") {
      arr = arr.filter((d) => d.status === statusFilter);
    }
    if (carrierFilter !== "all") {
      arr = arr.filter((d) => (d.carrier || "") === carrierFilter);
    }
    if (dateFrom) {
      const cutoff = new Date(dateFrom).getTime();
      arr = arr.filter((d) =>
        d.created_at ? Date.parse(d.created_at) >= cutoff : false
      );
    }
    if (dateTo) {
      const cutoff = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
      arr = arr.filter((d) =>
        d.created_at ? Date.parse(d.created_at) <= cutoff : false
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (d) =>
          (d.tracking_number || "").toLowerCase().includes(q) ||
          (d.recipient_name || "").toLowerCase().includes(q) ||
          (d.report?.case_number || "").toLowerCase().includes(q) ||
          (d.report?.name || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [deliveries, search, statusFilter, carrierFilter, dateFrom, dateTo]);

  const onSaved = (saved: DeliveryWithReport) => {
    setDeliveries((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setEditing(null);
    setCreating(false);
  };

  const onDeleted = (id: string) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
    setEditing(null);
  };

  return (
    <>
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Deliveries
            </h1>
            <p className="mt-1 text-sm text-muted">
              Shipments tied to recovered cases. Mark a delivery as
              delivered to close its source case automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDeliveries}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              + New delivery
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Pending shipment"
          value={stats.pending}
          tone="amber"
          helper="Awaiting carrier handoff"
        />
        <StatCard
          label="In transit"
          value={stats.inTransit}
          tone="sky"
          helper="Shipped or moving"
        />
        <StatCard
          label="Delivered today"
          value={stats.deliveredToday}
          tone="emerald"
          helper="Closed today via delivery"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          tone="red"
          helper="Needs intervention"
        />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tracking, recipient, or case number"
          className={compactInput}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${compactInput} sm:w-40`}
        >
          <option value="all">All statuses</option>
          {DELIVERY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {DELIVERY_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className={`${compactInput} sm:w-40`}
        >
          <option value="all">All carriers</option>
          {carriers.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="From date"
          className={`${compactInput} sm:w-40`}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="To date"
          className={`${compactInput} sm:w-40`}
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
                <th className="px-4 py-3 text-left font-semibold">Recipient</th>
                <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">
                  Carrier
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Tracking
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Shipped
                </th>
                <th className="px-4 py-3 text-right font-semibold">Edit</th>
              </tr>
            </thead>
            <tbody>
              {loading && deliveries.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    Loading deliveries…
                  </td>
                </tr>
              )}
              {!loading && deliveries.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No deliveries yet. Create one from a Report's detail
                    page or use "+ New delivery".
                  </td>
                </tr>
              )}
              {!loading &&
                deliveries.length > 0 &&
                filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-muted"
                    >
                      No deliveries match the current filter.
                    </td>
                  </tr>
                )}
              {filtered.map((d) => (
                <Row
                  key={d.id}
                  delivery={d}
                  onClick={() => setEditing(d)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || creating) && (
        <DeliveryForm
          delivery={editing}
          password={password}
          onUnauthorized={onUnauthorized}
          onSaved={onSaved}
          onDeleted={onDeleted}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </>
  );
}

function Row({
  delivery: d,
  onClick,
}: {
  delivery: DeliveryWithReport;
  onClick: () => void;
}) {
  const caseNumber = d.report?.case_number;
  return (
    <tr className="border-b border-border hover:bg-alt/60">
      <td className="px-4 py-3">
        {caseNumber ? (
          <a
            href={`/admin?case=${encodeURIComponent(caseNumber)}`}
            className="font-mono text-sm font-semibold text-accent hover:underline"
          >
            {caseNumber}
          </a>
        ) : (
          <span className="text-muted/60">—</span>
        )}
        {d.report?.name && (
          <div className="mt-0.5 text-xs text-muted">{d.report.name}</div>
        )}
      </td>
      <td className="px-4 py-3 text-foreground">
        {d.recipient_name || <span className="text-muted/60">—</span>}
        {d.recipient_country && (
          <div className="text-xs text-muted">{d.recipient_country}</div>
        )}
      </td>
      <td className="hidden px-4 py-3 text-body sm:table-cell">
        {d.carrier || <span className="text-muted/60">—</span>}
      </td>
      <td className="hidden px-4 py-3 font-mono text-xs text-body md:table-cell">
        {d.tracking_number || <span className="text-muted/60">—</span>}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${DELIVERY_STATUS_BADGE[d.status as DeliveryStatus]}`}
        >
          {DELIVERY_STATUS_LABELS[d.status as DeliveryStatus]}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">
        {d.shipped_at
          ? formatDateTime(d.shipped_at) || formatDate(d.shipped_at)
          : <span className="text-muted/60">—</span>}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onClick}
          className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-alt"
        >
          Edit
        </button>
      </td>
    </tr>
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
