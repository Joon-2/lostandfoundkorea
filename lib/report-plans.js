export const REPORT_PLAN_PRICES = {
  recovery: "39.00",
  all_in_one: "79.00",
};

export const REPORT_PLAN_LABELS = {
  recovery: "Recovery",
  all_in_one: "All-in-One",
};

export function getReportPlanPrice(plan) {
  return REPORT_PLAN_PRICES[plan] || REPORT_PLAN_PRICES.recovery;
}
