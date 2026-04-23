export const CATEGORIES = [
  { icon: '📱', label: 'Phone / Electronics', value: 'Phone / Electronics' },
  { icon: '👜', label: 'Bag / Wallet', value: 'Bag / Wallet' },
  { icon: '🛂', label: 'Passport / ID', value: 'Passport / ID' },
  { icon: '🔑', label: 'Keys', value: 'Keys' },
  { icon: '👕', label: 'Clothing / Accessories', value: 'Clothing / Accessories' },
  { icon: '📦', label: 'Other', value: 'Other' },
]

export const LOCATIONS = [
  'Subway / Train',
  'Bus',
  'Taxi',
  'Restaurant / Cafe',
  'Hotel',
  'Airport',
  'Shopping Mall / Store',
  'Street / Park',
  'Tourist Attraction',
  'Other',
]

export const TIME_OPTIONS = [
  'Morning (6-9 AM)',
  'Late Morning (9-12 PM)',
  'Afternoon (12-3 PM)',
  'Late Afternoon (3-6 PM)',
  'Evening (6-9 PM)',
  'Night (9 PM-12 AM)',
  'Late Night (12-6 AM)',
  'Not sure',
]

export const DATE_CONFIDENCE = [
  'Exact date',
  '± 1 day',
  '± 2-3 days',
  'Not sure, around this date',
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
