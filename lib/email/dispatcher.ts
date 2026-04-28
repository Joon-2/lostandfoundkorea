import type { EmailPayload } from "@/types/email";
import { DEFAULT_LOCALE, type Locale } from "@/config/locales";

import * as confirmationEn from "./templates/confirmation.en";
import * as confirmationJa from "./templates/confirmation.ja";
import * as paymentLinkEn from "./templates/payment-link.en";
import * as paymentLinkJa from "./templates/payment-link.ja";
import * as notFoundEn from "./templates/not-found.en";
import * as notFoundJa from "./templates/not-found.ja";
import * as infoRequestEn from "./templates/info-request.en";
import * as infoRequestJa from "./templates/info-request.ja";
import * as receiptEn from "./templates/receipt.en";
import * as receiptJa from "./templates/receipt.ja";
import * as shippingQuoteEn from "./templates/shipping-quote.en";
import * as shippingQuoteJa from "./templates/shipping-quote.ja";
import * as trackingEn from "./templates/tracking.en";
import * as trackingJa from "./templates/tracking.ja";

// Per-locale template registry. Adding a new locale: drop X.<locale>.ts
// files in templates/, add a "<locale>" key here, and the dispatcher
// picks them up. Falls back to English if a locale's template is
// missing — currently every type ships en+ja so the fallback is dead
// code, but it's the safety net for partial future locales.
const TEMPLATES = {
  confirmation: { en: confirmationEn, ja: confirmationJa },
  payment_link: { en: paymentLinkEn, ja: paymentLinkJa },
  not_found: { en: notFoundEn, ja: notFoundJa },
  info_request: { en: infoRequestEn, ja: infoRequestJa },
  receipt: { en: receiptEn, ja: receiptJa },
  shipping_quote: { en: shippingQuoteEn, ja: shippingQuoteJa },
  tracking: { en: trackingEn, ja: trackingJa },
} as const;

function pickTemplate<T extends keyof typeof TEMPLATES>(
  type: T,
  locale: Locale | undefined
) {
  const set = TEMPLATES[type];
  const resolved = locale && locale in set ? locale : DEFAULT_LOCALE;
  if (resolved !== locale && locale) {
    console.warn(
      `[email] missing ${type}.${locale}.ts template, falling back to ${type}.${DEFAULT_LOCALE}.ts`
    );
  }
  return set[resolved as keyof typeof set];
}

// Unified dispatcher keyed on EmailPayload.type. Locale comes from the
// payload (in turn pulled from the case's stored locale by the calling
// API route); when it's missing, we default to English. All subjects
// include [LFK-XXXXXX] (the case number). From address is always
// "Lost and Found Korea" <support@lostandfoundkorea.com> via siteConfig.
export async function sendEmail(payload: EmailPayload) {
  const { type, to, caseNumber, data = {}, locale } = payload;
  switch (type) {
    case "confirmation": {
      const t = pickTemplate("confirmation", locale);
      return t.sendConfirmationEmail({
        email: to,
        caseNumber,
        name: data.name,
        category: data.category,
        itemDescription: data.itemDescription,
        location: data.location,
      });
    }
    case "payment_link": {
      const t = pickTemplate("payment_link", locale);
      return t.sendPaymentEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        planLabel: data.planLabel,
      });
    }
    case "not_found": {
      const t = pickTemplate("not_found", locale);
      return t.sendNotFoundEmail({
        email: to,
        caseNumber,
        name: data.name,
        location: data.location,
        reason: data.reason,
      });
    }
    case "info_request": {
      const t = pickTemplate("info_request", locale);
      return t.sendInfoRequestEmail({
        email: to,
        caseNumber,
        name: data.name,
        infoText: data.infoText,
      });
    }
    case "receipt": {
      const t = pickTemplate("receipt", locale);
      return t.sendReceiptEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        transactionId: data.transactionId,
        paidAt: data.paidAt,
        planLabel: data.planLabel,
      });
    }
    case "shipping_quote": {
      const t = pickTemplate("shipping_quote", locale);
      return t.sendShippingQuoteEmail({
        email: to,
        caseNumber,
        name: data.name,
        amount: data.amount,
        notes: data.notes,
        shippingAddress: data.shippingAddress,
      });
    }
    case "tracking": {
      const t = pickTemplate("tracking", locale);
      return t.sendTrackingEmail({
        email: to,
        caseNumber,
        name: data.name,
        trackingNumber: data.trackingNumber,
        shippingMethod: data.shippingMethod,
        estimatedDelivery: data.estimatedDelivery,
      });
    }
    default: {
      const exhaustive: never = type;
      throw new Error(`Unknown email type: ${String(exhaustive)}`);
    }
  }
}
