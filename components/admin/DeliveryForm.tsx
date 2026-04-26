"use client";

import { useEffect, useState } from "react";
import {
  DELIVERY_STATUSES,
  DELIVERY_STATUS_LABELS,
  type Delivery,
  type DeliveryStatus,
  type DeliveryWithReport,
} from "@/types/delivery";
import { inputCls } from "@/components/admin/styles";
import Field from "@/components/admin/Field";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import { adminFetch } from "@/lib/admin-fetch";

type FormState = {
  case_number: string; // create mode only
  status: DeliveryStatus;
  carrier: string;
  tracking_number: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_country: string;
  shipping_fee: string;
  shipping_fee_currency: string;
  shipped_at: string;
  delivered_at: string;
  notes: string;
};

type DeliveryFormProps = {
  delivery: DeliveryWithReport | null; // null = create
  password: string;
  onUnauthorized?: () => void;
  onSaved: (d: DeliveryWithReport) => void;
  onDeleted?: (id: string) => void;
  onClose: () => void;
  // Pre-fill for "Create delivery from a report" flow.
  initialReportId?: string;
  initialCaseNumber?: string;
  initialPrefill?: Partial<{
    recipient_name: string;
    recipient_address: string;
  }>;
};

function emptyState(): FormState {
  return {
    case_number: "",
    status: "pending",
    carrier: "",
    tracking_number: "",
    recipient_name: "",
    recipient_phone: "",
    recipient_address: "",
    recipient_country: "",
    shipping_fee: "",
    shipping_fee_currency: "USD",
    shipped_at: "",
    delivered_at: "",
    notes: "",
  };
}

function fromDelivery(d: DeliveryWithReport): FormState {
  return {
    case_number: d.report?.case_number || "",
    status: d.status,
    carrier: d.carrier || "",
    tracking_number: d.tracking_number || "",
    recipient_name: d.recipient_name || "",
    recipient_phone: d.recipient_phone || "",
    recipient_address: d.recipient_address || "",
    recipient_country: d.recipient_country || "",
    shipping_fee: d.shipping_fee != null ? String(d.shipping_fee) : "",
    shipping_fee_currency: d.shipping_fee_currency || "USD",
    shipped_at: d.shipped_at ? toLocalInput(d.shipped_at) : "",
    delivered_at: d.delivered_at ? toLocalInput(d.delivered_at) : "",
    notes: d.notes || "",
  };
}

// "2026-04-26T13:45:00.000Z" → "2026-04-26T13:45" for <input type="datetime-local">
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DeliveryForm({
  delivery,
  password,
  onUnauthorized,
  onSaved,
  onDeleted,
  onClose,
  initialReportId,
  initialCaseNumber,
  initialPrefill,
}: DeliveryFormProps) {
  const isEdit = delivery !== null;
  const [data, setData] = useState<FormState>(() => {
    if (delivery) return fromDelivery(delivery);
    const base = emptyState();
    if (initialCaseNumber) base.case_number = initialCaseNumber;
    if (initialPrefill?.recipient_name)
      base.recipient_name = initialPrefill.recipient_name;
    if (initialPrefill?.recipient_address)
      base.recipient_address = initialPrefill.recipient_address;
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<StatusMsg | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const update =
    <K extends keyof FormState>(key: K) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setData((d) => ({ ...d, [key]: e.target.value as FormState[K] }));
    };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setMsg(null);
    if (!isEdit && !initialReportId && !data.case_number.trim()) {
      setMsg({ kind: "err", text: "Case number is required." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(isEdit
          ? {}
          : initialReportId
          ? { report_id: initialReportId }
          : { case_number: data.case_number.trim() }),
        status: data.status,
        carrier: data.carrier,
        tracking_number: data.tracking_number,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        recipient_address: data.recipient_address,
        recipient_country: data.recipient_country,
        shipping_fee: data.shipping_fee,
        shipping_fee_currency: data.shipping_fee_currency,
        shipped_at: data.shipped_at,
        delivered_at: data.delivered_at,
        notes: data.notes,
      };

      const url = isEdit
        ? `/api/deliveries/${delivery!.id}`
        : "/api/deliveries";
      const method = isEdit ? "PUT" : "POST";
      const json = await adminFetch<{
        ok: boolean;
        delivery: DeliveryWithReport;
        error?: string;
      }>(url, {
        method,
        body: payload,
        password,
        onUnauthorized,
      });
      if (!json.ok) throw new Error(json.error || "Save failed");
      onSaved(json.delivery);
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || deleting) return;
    if (!window.confirm("Delete this delivery? This cannot be undone.")) return;
    setDeleting(true);
    setMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; error?: string }>(
        `/api/deliveries/${delivery!.id}`,
        {
          method: "DELETE",
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Delete failed");
      onDeleted?.(delivery!.id);
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-serif text-xl tracking-tight">
              {isEdit ? "Edit delivery" : "New delivery"}
            </h2>
            {isEdit && delivery?.report && (
              <p className="mt-0.5 text-xs text-muted">
                Case{" "}
                <a
                  href={`/admin?case=${encodeURIComponent(delivery.report.case_number)}`}
                  className="font-mono text-accent hover:underline"
                >
                  {delivery.report.case_number}
                </a>{" "}
                · {delivery.report.name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground"
          >
            Close
          </button>
        </header>

        <form onSubmit={handleSave} className="space-y-5 px-6 py-5">
          {!isEdit && !initialReportId && (
            <Field label="Case number *">
              <input
                type="text"
                className={inputCls}
                value={data.case_number}
                onChange={update("case_number")}
                placeholder="e.g. LFK-123456"
                required
              />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select
                className={inputCls}
                value={data.status}
                onChange={update("status")}
              >
                {DELIVERY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DELIVERY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Carrier">
              <input
                type="text"
                className={inputCls}
                value={data.carrier}
                onChange={update("carrier")}
                placeholder="e.g. CJ Logistics, DHL, EMS"
              />
            </Field>
            <Field label="Tracking number">
              <input
                type="text"
                className={inputCls}
                value={data.tracking_number}
                onChange={update("tracking_number")}
              />
            </Field>
            <Field label="Country">
              <input
                type="text"
                className={inputCls}
                value={data.recipient_country}
                onChange={update("recipient_country")}
                placeholder="e.g. Japan"
              />
            </Field>
            <Field label="Recipient name">
              <input
                type="text"
                className={inputCls}
                value={data.recipient_name}
                onChange={update("recipient_name")}
              />
            </Field>
            <Field label="Recipient phone">
              <input
                type="text"
                className={inputCls}
                value={data.recipient_phone}
                onChange={update("recipient_phone")}
              />
            </Field>
          </div>

          <Field label="Recipient address">
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              value={data.recipient_address}
              onChange={update("recipient_address")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Field label="Shipping fee">
              <input
                type="text"
                inputMode="decimal"
                className={inputCls}
                value={data.shipping_fee}
                onChange={update("shipping_fee")}
                placeholder="e.g. 45"
              />
            </Field>
            <Field label="Currency">
              <input
                type="text"
                className={inputCls}
                value={data.shipping_fee_currency}
                onChange={update("shipping_fee_currency")}
                maxLength={3}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shipped at">
              <input
                type="datetime-local"
                className={inputCls}
                value={data.shipped_at}
                onChange={update("shipped_at")}
              />
            </Field>
            <Field label="Delivered at">
              <input
                type="datetime-local"
                className={inputCls}
                value={data.delivered_at}
                onChange={update("delivered_at")}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              value={data.notes}
              onChange={update("notes")}
            />
          </Field>

          <StatusPill msg={msg} />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : isEdit
                  ? "Save changes"
                  : "Create delivery"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
