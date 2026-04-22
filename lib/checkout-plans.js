export const CHECKOUT_PLANS = {
  "all-in-one": {
    label: "All-in-One",
    price: "79.00",
    process_stage: "searching",
    description: "Lost & Found Korea — All-in-One (search + delivery)",
  },
  "delivery-only": {
    label: "Delivery Only",
    price: "49.00",
    process_stage: "pickup_scheduled",
    description: "Lost & Found Korea — Delivery Only",
  },
};

export function getPlan(plan) {
  return CHECKOUT_PLANS[plan] || null;
}
