export interface EmailPayload {
  to: string
  subject: string
  type: 'confirmation' | 'payment_link' | 'not_found' | 'info_request' | 'receipt' | 'shipping_quote' | 'tracking'
  caseNumber: string
  data: Record<string, any>
}
