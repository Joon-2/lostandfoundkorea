// Public surface for the email module. Importing "@/lib/email" resolves
// here once the legacy lib/email.ts file is removed; see dispatcher.ts
// for sendEmail() and templates/* for the per-type builders/senders.

export { sendEmail } from "./dispatcher";

export {
  buildConfirmationEmail,
  sendConfirmationEmail,
} from "./templates/confirmation";

export {
  buildPaymentEmail,
  sendPaymentEmail,
} from "./templates/payment-link";

export {
  buildNotFoundEmail,
  sendNotFoundEmail,
} from "./templates/not-found";

export {
  buildInfoRequestEmail,
  sendInfoRequestEmail,
} from "./templates/info-request";

export {
  buildReceiptEmail,
  sendReceiptEmail,
} from "./templates/receipt";

export {
  buildShippingQuoteEmail,
  sendShippingQuoteEmail,
} from "./templates/shipping-quote";

export {
  buildTrackingEmail,
  sendTrackingEmail,
} from "./templates/tracking";

export { sendCustomerReplyNotification } from "./templates/customer-reply";
