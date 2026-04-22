export const PROCESS_STAGES = [
  { key: "received", label: "Received", status: "pending" },
  { key: "searching", label: "Searching", status: "pending" },
  { key: "found", label: "Found", status: "found" },
  { key: "payment_sent", label: "Payment Sent", status: "found" },
  { key: "paid", label: "Paid", status: "paid" },
  { key: "pickup", label: "Pickup", status: "paid" },
  { key: "completed", label: "Completed", status: "paid" },
];

const STAGE_MAP = Object.fromEntries(PROCESS_STAGES.map((s) => [s.key, s]));

export function getStageLabel(key) {
  if (!key) return "";
  if (STAGE_MAP[key]) return STAGE_MAP[key].label;
  return key
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}
