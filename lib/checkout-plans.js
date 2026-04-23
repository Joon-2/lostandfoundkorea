import { plans } from "@/config/plans";

export const CHECKOUT_PLANS = {
  "all-in-one": {
    label: plans.all_in_one.name,
    price: plans.all_in_one.priceSeoul.toFixed(2),
    process_stage: "searching",
    description: "Lost & Found Korea — All-in-One (search + delivery)",
  },
  "delivery-only": {
    label: plans.delivery_only.name,
    price: plans.delivery_only.priceSeoul.toFixed(2),
    process_stage: "pickup_scheduled",
    description: "Lost & Found Korea — Delivery Only",
  },
};

export function getPlan(plan) {
  return CHECKOUT_PLANS[plan] || null;
}
