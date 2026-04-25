import { DELIVERY_STATUSES, type DeliveryStatus } from "@/types/delivery";

const STRING_FIELDS = [
  "carrier",
  "tracking_number",
  "recipient_name",
  "recipient_phone",
  "recipient_address",
  "recipient_country",
  "shipping_fee_currency",
  "notes",
] as const;

const TIMESTAMP_FIELDS = ["shipped_at", "delivered_at"] as const;

// Whitelist + coerce input for deliveries insert/update. Strings trimmed
// with "" → null. Timestamps parsed defensively (invalid → null).
// shipping_fee coerced to a finite number or null. status validated
// against the enum.
export function sanitizeDeliveryInput(input: any): Record<string, any> {
  const out: Record<string, any> = {};

  for (const f of STRING_FIELDS) {
    if (f in input) {
      const v = (input as any)[f];
      out[f] = typeof v === "string" ? v.trim() || null : v ?? null;
    }
  }

  for (const f of TIMESTAMP_FIELDS) {
    if (f in input) {
      const v = (input as any)[f];
      if (v == null || v === "") {
        out[f] = null;
      } else {
        const d = new Date(v);
        out[f] = Number.isNaN(d.getTime()) ? null : d.toISOString();
      }
    }
  }

  if ("status" in input) {
    const s = String((input as any).status);
    if (DELIVERY_STATUSES.includes(s as DeliveryStatus)) {
      out.status = s;
    }
  }

  if ("shipping_fee" in input) {
    const v = (input as any).shipping_fee;
    if (v === "" || v == null) {
      out.shipping_fee = null;
    } else {
      const n = Number(v);
      out.shipping_fee = Number.isFinite(n) ? n : null;
    }
  }

  return out;
}

// For POST: caller may identify the source report by report_id (UUID)
// OR case_number (LFK-XXXXXX). Returned shape is what we pass to
// supabase queries.
export type DeliveryReportRef =
  | { kind: "id"; report_id: string }
  | { kind: "case_number"; case_number: string };

export function pickReportRef(input: any): DeliveryReportRef | null {
  if (input?.report_id && typeof input.report_id === "string") {
    return { kind: "id", report_id: input.report_id };
  }
  if (input?.case_number && typeof input.case_number === "string") {
    return { kind: "case_number", case_number: input.case_number.trim() };
  }
  return null;
}
