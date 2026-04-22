export const PHASE1_STAGES = [
  { key: "received", label: "Received", status: "pending" },
  { key: "searching", label: "Searching", status: "pending" },
  { key: "found", label: "Found", status: "found" },
  { key: "payment_sent", label: "Payment Sent", status: "found" },
  { key: "paid", label: "Paid", status: "paid" },
];

export const PHASE2_STAGES = [
  { key: "pickup_scheduled", label: "Pickup Scheduled", status: "paid" },
  { key: "picked_up", label: "Picked Up", status: "paid" },
  { key: "shipping_quote", label: "Shipping Quote", status: "paid" },
  { key: "quote_accepted", label: "Quote Accepted", status: "paid" },
  { key: "shipped", label: "Shipped", status: "paid" },
  { key: "delivered", label: "Delivered", status: "paid" },
  { key: "completed", label: "Completed", status: "paid" },
];

export const PROCESS_STAGES = [...PHASE1_STAGES, ...PHASE2_STAGES];

const STAGE_MAP = Object.fromEntries(PROCESS_STAGES.map((s) => [s.key, s]));

const LEGACY_STAGE_MAP = {
  pickup: "pickup_scheduled",
};

export function normalizeStageKey(key) {
  if (!key) return "received";
  return LEGACY_STAGE_MAP[key] || key;
}

export function getStageLabel(key) {
  const k = normalizeStageKey(key);
  if (STAGE_MAP[k]) return STAGE_MAP[k].label;
  return k
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export function getStagePhase(key) {
  const k = normalizeStageKey(key);
  if (PHASE1_STAGES.some((s) => s.key === k)) return 1;
  if (PHASE2_STAGES.some((s) => s.key === k)) return 2;
  return 1;
}

export function isDeliveryRequired(report) {
  if (!report) return false;
  if (report.plan === "all_in_one") return true;
  if (report.pickup_addon_transaction_id) return true;
  const stage = normalizeStageKey(report.process_stage);
  if (PHASE2_STAGES.some((s) => s.key === stage)) return true;
  return false;
}
