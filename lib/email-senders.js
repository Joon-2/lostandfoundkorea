import { siteConfig } from "@/config/site";
import { plans } from "@/config/plans";
import {
  SITE_URL,
  escapeHtml,
  renderEmail,
  sendViaGmail,
  paragraph,
  strongLine,
  kvList,
} from "@/lib/email/render";

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

// ─── Receipt ──────────────────────────────────────────────────────────────

function buildReceiptEmail({
  name,
  caseNumber,
  amount,
  transactionId,
  paidAt,
  planLabel,
}) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Payment receipt (${caseNumber})`;
  const dateStr = new Date(paidAt || Date.now()).toUTCString();
  const planLine = planLabel ? ` (${planLabel})` : "";
  const planLineHtml = planLabel
    ? ` <span style="color:#718096;">(${escapeHtml(planLabel)})</span>`
    : "";
  const link = `${SITE_URL}/pay/${encodeURIComponent(caseNumber)}`;

  const bodyHtml = [
    paragraph("Thanks for your payment. Here&rsquo;s your receipt."),
    kvList([
      [
        "Case reference",
        `<span style="font-family:'SFMono-Regular',Menlo,monospace;">${escapeHtml(
          caseNumber
        )}</span>`,
      ],
      [
        "Amount paid",
        `<strong>$${escapeHtml(String(amount))}</strong>${planLineHtml}`,
      ],
      [
        "Transaction ID",
        `<span style="font-family:'SFMono-Regular',Menlo,monospace;font-size:12px;">${escapeHtml(
          transactionId
        )}</span>`,
      ],
      ["Date", escapeHtml(dateStr)],
    ]),
    paragraph("Recovery details are available on your case page."),
    `<p style="margin:0 0 14px;"><a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 22px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px;">Open case page</a></p>`,
  ].join("");

  const bodyText = `Thanks for your payment. Here's your receipt:

Case reference: ${caseNumber}
Amount paid: $${amount}${planLine}
Transaction ID: ${transactionId}
Date: ${dateStr}

Recovery details are available at ${link}`;

  const { html, text } = renderEmail({ greeting, bodyHtml, bodyText, caseNumber });
  return { subject, html, text };
}

export async function sendReceiptEmail({
  name,
  email,
  caseNumber,
  amount,
  transactionId,
  paidAt,
  planLabel,
}) {
  const built = buildReceiptEmail({
    name,
    caseNumber,
    amount,
    transactionId,
    paidAt,
    planLabel,
  });
  await sendViaGmail({ to: email, ...built });
}

export {
  buildShippingQuoteEmail,
  sendShippingQuoteEmail,
} from "@/lib/email/templates/shipping-quote";

export {
  buildTrackingEmail,
  sendTrackingEmail,
} from "@/lib/email/templates/tracking";

export { sendCustomerReplyNotification } from "@/lib/email/templates/customer-reply";
