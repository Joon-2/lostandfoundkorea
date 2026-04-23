import { plans } from "@/config/plans";

export const REPORT_PLAN_PRICES = {
  recovery: plans.recovery.paymentPrice.toFixed(2),
  all_in_one: plans.all_in_one.priceSeoul.toFixed(2),
};

export const REPORT_PLAN_LABELS = {
  recovery: plans.recovery.name,
  all_in_one: plans.all_in_one.name,
};

export function getReportPlanPrice(plan) {
  return REPORT_PLAN_PRICES[plan] || REPORT_PLAN_PRICES.recovery;
}
