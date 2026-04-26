"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";
import {
  DELIVERY_STATUS_BADGE,
  DELIVERY_STATUS_LABELS,
  type DeliveryStatus,
  type DeliveryWithReport,
} from "@/types/delivery";
import DeliveryForm from "@/components/admin/DeliveryForm";
import { adminFetch } from "@/lib/admin-fetch";

type DeliveryPanelProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
};

// Embedded inside CaseDetail when isDeliveryRequired(report). Lists
// deliveries already linked to this case and offers a "+ Create
// delivery" button that opens the DeliveryForm with report_id and
// recipient pre-filled.
export default function DeliveryPanel({
  report,
  password,
  onUnauthorized,
}: DeliveryPanelProps) {
  const [deliveries, setDeliveries] = useState<DeliveryWithReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DeliveryWithReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await adminFetch<{
        ok: boolean;
        deliveries?: DeliveryWithReport[];
      }>(
        `/api/deliveries?report_id=${encodeURIComponent(report.id)}`,
        { password, onUnauthorized }
      );
      if (json.ok) setDeliveries(json.deliveries || []);
    } catch (err) {
      console.error("[DeliveryPanel] load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [report.id, password, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

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
    setCreating(false);
    setEditing(null);
  };

  const onDeleted = (id: string) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
    setEditing(null);
  };

  const recipientPrefill = {
    recipient_name: report.name || "",
    recipient_address: report.shipping_address || "",
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Deliveries
        </h3>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          + Create delivery
        </button>
      </div>

      {loading && deliveries.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-alt px-4 py-3 text-sm text-muted">
          Loading…
        </p>
      ) : deliveries.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-alt px-4 py-3 text-sm text-muted">
          No deliveries yet for this case.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {deliveries.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${DELIVERY_STATUS_BADGE[d.status as DeliveryStatus]}`}
                >
                  {DELIVERY_STATUS_LABELS[d.status as DeliveryStatus]}
                </span>
                {d.carrier && (
                  <span className="text-foreground">{d.carrier}</span>
                )}
                {d.tracking_number && (
                  <span className="font-mono text-xs text-muted">
                    {d.tracking_number}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                {d.shipped_at && (
                  <span>Shipped {formatDateTime(d.shipped_at)}</span>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(d)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground hover:bg-alt"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <DeliveryForm
          delivery={editing}
          password={password}
          onUnauthorized={onUnauthorized}
          onSaved={onSaved}
          onDeleted={onDeleted}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          initialReportId={creating ? report.id : undefined}
          initialCaseNumber={
            creating ? report.case_number || undefined : undefined
          }
          initialPrefill={creating ? recipientPrefill : undefined}
        />
      )}
    </section>
  );
}
