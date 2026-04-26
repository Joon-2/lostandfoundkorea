// Backward-compat shim. The actual templates live in lib/email/templates/.
// Existing importers of "@/lib/email-senders" or "@/lib/email" continue to
// resolve every named sender/builder through here. Step 4 of the email
// refactor moves the dispatcher into lib/email/ and this file goes away.

export {
  buildConfirmationEmail,
  sendConfirmationEmail,
} from "@/lib/email/templates/confirmation";

export {
  buildPaymentEmail,
  sendPaymentEmail,
} from "@/lib/email/templates/payment-link";

export {
  buildNotFoundEmail,
  sendNotFoundEmail,
} from "@/lib/email/templates/not-found";

export {
  buildInfoRequestEmail,
  sendInfoRequestEmail,
} from "@/lib/email/templates/info-request";

export {
  buildReceiptEmail,
  sendReceiptEmail,
} from "@/lib/email/templates/receipt";

export {
  buildShippingQuoteEmail,
  sendShippingQuoteEmail,
} from "@/lib/email/templates/shipping-quote";

export {
  buildTrackingEmail,
  sendTrackingEmail,
} from "@/lib/email/templates/tracking";

export { sendCustomerReplyNotification } from "@/lib/email/templates/customer-reply";
