export type DeliveryStatus =
  | "pending"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "failed"
  | "returned";

export const DELIVERY_STATUSES: DeliveryStatus[] = [
  "pending",
  "shipped",
  "in_transit",
  "delivered",
  "failed",
  "returned",
];

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "Pending",
  shipped: "Shipped",
  in_transit: "In transit",
  delivered: "Delivered",
  failed: "Failed",
  returned: "Returned",
};

// Tailwind class set for status pills (mirrors the admin Reports
// status palette so the dashboards feel consistent).
export const DELIVERY_STATUS_BADGE: Record<DeliveryStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-sky-50 text-sky-700 border-sky-200",
  in_transit: "bg-sky-50 text-sky-700 border-sky-200",
  delivered: "bg-emerald-50 text-accent border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-slate-100 text-slate-700 border-slate-200",
};

export interface Delivery {
  id: string;
  report_id: string;
  status: DeliveryStatus;
  carrier: string | null;
  tracking_number: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;
  recipient_country: string | null;
  shipping_fee: number | null;
  shipping_fee_currency: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Lightweight projection of the linked report shown alongside a
// delivery in list/detail views. Returned by the GET endpoints via a
// Supabase foreign-key join.
export interface DeliveryReportLink {
  id: string;
  case_number: string;
  name: string | null;
  email: string | null;
  status: string | null;
}

export interface DeliveryWithReport extends Delivery {
  report: DeliveryReportLink | null;
}
