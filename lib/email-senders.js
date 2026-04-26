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

// ─── Payment link ─────────────────────────────────────────────────────────

function buildPaymentEmail({
  name,
  caseNumber,
  amount = String(plans.recovery.paymentPrice),
  planLabel = "",
}) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Your item has been found (${caseNumber})`;
  const link = `${SITE_URL}/pay/${encodeURIComponent(caseNumber)}`;
  const planSuffix = planLabel ? ` (${planLabel})` : "";
  const planSuffixHtml = planLabel ? ` (${escapeHtml(planLabel)})` : "";
  const amountStr = String(amount);

  const bodyHtml = [
    `<p style="margin:0 0 14px;font-size:18px;font-weight:600;line-height:1.4;color:#1a202c;">Your item has been found! Pay $${escapeHtml(
      amountStr
    )} to unlock recovery details${planSuffixHtml}.</p>`,
    strongLine("Case reference", caseNumber),
    `<p style="margin:18px 0;"><a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:15px;">Pay $${escapeHtml(
      amountStr
    )} to unlock</a></p>`,
    `<p style="margin:0 0 14px;font-size:13px;color:#718096;">Or open this link in your browser:<br><a href="${link}" style="color:#4a5568;word-break:break-all;">${link}</a></p>`,
    paragraph(
      "Once paid, you&rsquo;ll see the exact recovery location, contact phone, operating hours, and step-by-step English pickup instructions."
    ),
    paragraph(
      `<strong style="color:#059669;">Reminder:</strong> if the item turns out not to be yours, you pay nothing.`
    ),
  ].join("");

  const bodyText = `Your item has been found! Pay $${amountStr} to unlock recovery details${planSuffix}.

Case reference: ${caseNumber}

Open this link to complete the payment:
${link}

Once paid, you'll see the exact recovery location, contact phone, operating hours, and step-by-step English pickup instructions.

Reminder: if the item turns out not to be yours, you pay nothing.`;

  const { html, text } = renderEmail({ greeting, bodyHtml, bodyText, caseNumber });
  return { subject, html, text };
}

export async function sendPaymentEmail({
  name,
  email,
  caseNumber,
  amount,
  planLabel,
}) {
  const built = buildPaymentEmail({ name, caseNumber, amount, planLabel });
  await sendViaGmail({ to: email, ...built });
}

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
