import type { EmailPayload } from "@/types/email";
import * as templates from "./email-senders.js";

// Re-export every existing named sender/builder from email-senders.js so
// the many admin API routes that already import `buildConfirmationEmail`,
// `sendConfirmationEmail`, etc. from "@/lib/email" keep working unchanged.
export * from "./email-senders.js";

// Unified dispatcher keyed on EmailPayload.type. Accepts the typed payload
// and routes to the appropriate template+sender pair. All subjects include
// [LFK-XXXXXX] (the case number). From address is always
// "Lost and Found Korea" <support@lostandfoundkorea.com> via siteConfig.
export async function sendEmail(payload: EmailPayload) {
  const { type, to, caseNumber, data = {} } = payload;
  switch (type) {
    case "confirmation":
      return templates.sendConfirmationEmail({
        email: to,
        caseNumber,
        name: data.name,
        category: data.category,
        itemDescription: data.itemDescription,
        location: data.location,
      });
    case "payment_link":
      return templates.sendPaymentEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        planLabel: data.planLabel,
      });
    case "not_found":
      return templates.sendNotFoundEmail({
        email: to,
        caseNumber,
        name: data.name,
        location: data.location,
        reason: data.reason,
      });
    case "info_request":
      return templates.sendInfoRequestEmail({
        email: to,
        caseNumber,
        name: data.name,
        infoText: data.infoText,
      });
    case "receipt":
      return templates.sendReceiptEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        transactionId: data.transactionId,
        paidAt: data.paidAt,
        planLabel: data.planLabel,
      });
    case "shipping_quote":
      return templates.sendShippingQuoteEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        notes: data.notes,
        shippingAddress: data.shippingAddress,
      });
    case "tracking":
      return templates.sendTrackingEmail({
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
