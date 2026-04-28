// Each entry is { value, labelKey } — `value` is the canonical English
// string sent to the API, stored in the DB, and shown in admin/emails;
// `labelKey` is a path under the `form` i18n namespace and drives the
// localized text rendered in the report form. Keep `value` strings
// EXACTLY as they are: changing them is a DB-compatibility break.
// CATEGORIES additionally carries `icon` + `label` for legacy callers
// that read .label directly (admin, sitemap, etc.).

export const CATEGORIES = [
  { icon: '📱', label: 'Phone / Electronics',     value: 'Phone / Electronics',     labelKey: 'options.categories.phone-electronics' },
  { icon: '👜', label: 'Bag / Wallet',            value: 'Bag / Wallet',            labelKey: 'options.categories.bag-wallet' },
  { icon: '🛂', label: 'Passport / ID',           value: 'Passport / ID',           labelKey: 'options.categories.passport-id' },
  { icon: '🔑', label: 'Keys',                    value: 'Keys',                    labelKey: 'options.categories.keys' },
  { icon: '👕', label: 'Clothing / Accessories',  value: 'Clothing / Accessories',  labelKey: 'options.categories.clothing-accessories' },
  { icon: '📦', label: 'Other',                   value: 'Other',                   labelKey: 'options.categories.other' },
]

export const LOCATIONS = [
  { value: 'Subway / Train',        labelKey: 'options.locations.subway-train' },
  { value: 'Bus',                   labelKey: 'options.locations.bus' },
  { value: 'Taxi',                  labelKey: 'options.locations.taxi' },
  { value: 'Restaurant / Cafe',     labelKey: 'options.locations.restaurant-cafe' },
  { value: 'Hotel',                 labelKey: 'options.locations.hotel' },
  { value: 'Airport',               labelKey: 'options.locations.airport' },
  { value: 'Shopping Mall / Store', labelKey: 'options.locations.shopping-mall-store' },
  { value: 'Street / Park',         labelKey: 'options.locations.street-park' },
  { value: 'Tourist Attraction',    labelKey: 'options.locations.tourist-attraction' },
  { value: 'Other',                 labelKey: 'options.locations.other' },
]

export const TIME_OPTIONS = [
  { value: 'Morning (6-9 AM)',       labelKey: 'options.timeOfDay.morning-6-9' },
  { value: 'Late Morning (9-12 PM)', labelKey: 'options.timeOfDay.late-morning-9-12' },
  { value: 'Afternoon (12-3 PM)',    labelKey: 'options.timeOfDay.afternoon-12-3' },
  { value: 'Late Afternoon (3-6 PM)',labelKey: 'options.timeOfDay.late-afternoon-3-6' },
  { value: 'Evening (6-9 PM)',       labelKey: 'options.timeOfDay.evening-6-9' },
  { value: 'Night (9 PM-12 AM)',     labelKey: 'options.timeOfDay.night-9-12' },
  { value: 'Late Night (12-6 AM)',   labelKey: 'options.timeOfDay.late-night-12-6' },
  { value: 'Not sure',               labelKey: 'options.timeOfDay.not-sure' },
]

export const DATE_CONFIDENCE = [
  { value: 'Exact date',                  labelKey: 'options.dateConfidence.exact' },
  { value: '± 1 day',                     labelKey: 'options.dateConfidence.plus-minus-1' },
  { value: '± 2-3 days',                  labelKey: 'options.dateConfidence.plus-minus-2-3' },
  { value: 'Not sure, around this date',  labelKey: 'options.dateConfidence.around-this-date' },
]

export const PROCESS_STAGES_PHASE1 = [
  { key: 'received', label: 'Received', number: 1 },
  { key: 'searching', label: 'Searching', number: 2 },
  { key: 'found', label: 'Found', number: 3 },
  { key: 'payment_sent', label: 'Payment Sent', number: 4 },
  { key: 'paid', label: 'Paid', number: 5 },
]

export const PROCESS_STAGES_PHASE2 = [
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', number: 1 },
  { key: 'picked_up', label: 'Picked Up', number: 2 },
  { key: 'shipping_quote', label: 'Shipping Quote', number: 3 },
  { key: 'quote_accepted', label: 'Quote Accepted', number: 4 },
  { key: 'shipped', label: 'Shipped', number: 5 },
  { key: 'delivered', label: 'Delivered', number: 6 },
  { key: 'completed', label: 'Completed', number: 7 },
]
