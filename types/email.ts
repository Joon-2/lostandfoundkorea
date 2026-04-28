export interface EmailPayload {
  to: string
  subject: string
  type: 'confirmation' | 'payment_link' | 'not_found' | 'info_request' | 'receipt' | 'shipping_quote' | 'tracking'
  caseNumber: string
  data: Record<string, any>
  // Locale of the customer; drives which per-locale template the
  // dispatcher picks. Defaults to 'en' if omitted.
  locale?: 'en' | 'ja'
}
