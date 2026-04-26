export const plans = {
  recovery: {
    id: 'recovery',
    name: 'Recovery',
    displayPrice: 'FREE',
    paymentPrice: 39,
    description: 'Free to start, $39 when found',
    features: [
      'Submit a 30-second report',
      'Our team searches in Korean on your behalf',
      'Email update within 24-48 hours',
      'Pay $39 to unlock pickup details — only if found',
    ],
    footnote: 'Pickup add-on from +$59',
  },
  all_in_one: {
    id: 'all_in_one',
    name: 'All-in-One',
    priceSeoul: 79,
    priceOther: 99,
    surcharge: 20,
    description: 'Search + pickup + delivery included',
    features: [
      'Everything in Recovery',
      'We coordinate pickup with the venue / authorities',
      'Domestic or international shipping included',
      'Single price upfront — no add-on fees',
    ],
    footnote: 'Outside Seoul/Gyeonggi +$20',
  },
  delivery_only: {
    id: 'delivery_only',
    name: 'Delivery Only',
    priceSeoul: 49,
    priceOther: 69,
    surcharge: 20,
    description: 'When you already know where the item is',
    features: [
      'You tell us where the item is being held',
      'We pick it up and ship it to your address',
      'Korean-language coordination on your behalf',
      'Tracking number emailed once it ships',
    ],
    footnote: 'Outside Seoul/Gyeonggi +$20',
  },
  pickup_addon: {
    id: 'pickup_addon',
    name: 'Pickup Add-on',
    price: 49,
    description: 'Add pickup & delivery after recovery payment',
  },
}

// ─── Recovery-flow plan helpers (was lib/report-plans.js) ────────────────

export const REPORT_PLAN_PRICES = {
  recovery: plans.recovery.paymentPrice.toFixed(2),
  all_in_one: plans.all_in_one.priceSeoul.toFixed(2),
}

export const REPORT_PLAN_LABELS = {
  recovery: plans.recovery.name,
  all_in_one: plans.all_in_one.name,
}

export function getReportPlanPrice(plan) {
  return REPORT_PLAN_PRICES[plan] || REPORT_PLAN_PRICES.recovery
}

// ─── Public-checkout plan helpers (was lib/checkout-plans.js) ────────────

export const CHECKOUT_PLANS = {
  'all-in-one': {
    label: plans.all_in_one.name,
    price: plans.all_in_one.priceSeoul.toFixed(2),
    process_stage: 'searching',
    description: 'Lost & Found Korea — All-in-One (search + delivery)',
  },
  'delivery-only': {
    label: plans.delivery_only.name,
    price: plans.delivery_only.priceSeoul.toFixed(2),
    process_stage: 'pickup_scheduled',
    description: 'Lost & Found Korea — Delivery Only',
  },
}

export function getPlan(plan) {
  return CHECKOUT_PLANS[plan] || null
}
