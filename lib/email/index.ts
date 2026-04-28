// Public surface for the email module. Importing "@/lib/email" resolves
// here. The per-locale template files live under templates/ as
// `<type>.<locale>.ts`; the dispatcher picks the right pair based on
// EmailPayload.locale. The named re-exports below preserve direct-import
// access to English builders/senders for legacy callers (e.g.
// /api/send-email/route.js currently imports buildConfirmationEmail
// directly). New code should call sendEmail() and pass `locale` so the
// case's language drives the template choice.

export { sendEmail } from "./dispatcher";

export {
  buildConfirmationEmail,
  sendConfirmationEmail,
} from "./templates/confirmation.en";

export {
  buildPaymentEmail,
  sendPaymentEmail,
} from "./templates/payment-link.en";

export {
  buildNotFoundEmail,
  sendNotFoundEmail,
} from "./templates/not-found.en";

export {
  buildInfoRequestEmail,
  sendInfoRequestEmail,
} from "./templates/info-request.en";

export {
  buildReceiptEmail,
  sendReceiptEmail,
} from "./templates/receipt.en";

export {
  buildShippingQuoteEmail,
  sendShippingQuoteEmail,
} from "./templates/shipping-quote.en";

export {
  buildTrackingEmail,
  sendTrackingEmail,
} from "./templates/tracking.en";

export { sendCustomerReplyNotification } from "./templates/customer-reply";
