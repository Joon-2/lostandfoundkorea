import type { EmailPayload } from "@/types/email";
import { sendConfirmationEmail } from "@/lib/email/templates/confirmation";
import { sendPaymentEmail } from "@/lib/email/templates/payment-link";
import { sendNotFoundEmail } from "@/lib/email/templates/not-found";
import { sendInfoRequestEmail } from "@/lib/email/templates/info-request";
import { sendReceiptEmail } from "@/lib/email/templates/receipt";
import { sendShippingQuoteEmail } from "@/lib/email/templates/shipping-quote";
import { sendTrackingEmail } from "@/lib/email/templates/tracking";

// Unified dispatcher keyed on EmailPayload.type. Accepts the typed payload
// and routes to the appropriate template+sender pair. All subjects include
// [LFK-XXXXXX] (the case number). From address is always
// "Lost and Found Korea" <support@lostandfoundkorea.com> via siteConfig.
export async function sendEmail(payload: EmailPayload) {
  const { type, to, caseNumber, data = {} } = payload;
  switch (type) {
    case "confirmation":
      return sendConfirmationEmail({
        email: to,
        caseNumber,
        name: data.name,
        category: data.category,
        itemDescription: data.itemDescription,
        location: data.location,
      });
    case "payment_link":
      return sendPaymentEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        planLabel: data.planLabel,
      });
    case "not_found":
      return sendNotFoundEmail({
        email: to,
        caseNumber,
        name: data.name,
        location: data.location,
        reason: data.reason,
      });
    case "info_request":
      return sendInfoRequestEmail({
        email: to,
        caseNumber,
        name: data.name,
        infoText: data.infoText,
      });
    case "receipt":
      return sendReceiptEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        transactionId: data.transactionId,
        paidAt: data.paidAt,
        planLabel: data.planLabel,
      });
    case "shipping_quote":
      return sendShippingQuoteEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        notes: data.notes,
        shippingAddress: data.shippingAddress,
      });
    case "tracking":
      return sendTrackingEmail({
        email: to,
        caseNumber,
        name: data.name,
        trackingNumber: data.trackingNumber,
        shippingMethod: data.shippingMethod,
        estimatedDelivery: data.estimatedDelivery,
      });
    default: {
      const exhaustive: never = type;
      throw new Error(`Unknown email type: ${String(exhaustive)}`);
    }
  }
}
