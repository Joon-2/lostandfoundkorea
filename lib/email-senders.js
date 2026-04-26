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

// ─── Confirmation ─────────────────────────────────────────────────────────

export function buildConfirmationEmail({
  name,
  caseNumber,
  category,
  itemDescription,
  location,
}) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `We received your report (${caseNumber})`;

  const summaryRows = [
    ["Item", category],
    ["Description", itemDescription],
    ["Last seen", location],
  ];
  const hasSummary = summaryRows.some(([, v]) => v);
  const escapedSummaryRows = summaryRows.map(([k, v]) => [k, v ? escapeHtml(v) : ""]);

  const bodyHtml = [
    paragraph(
      "Thanks for submitting your lost item report. Our team has received your case and will start searching right away."
    ),
    paragraph(
      `Your case reference: <strong style="font-family:'SFMono-Regular',Menlo,monospace;letter-spacing:0.05em;">${escapeHtml(
        caseNumber
      )}</strong> — save this to track your case.`
    ),
    hasSummary ? kvList(escapedSummaryRows) : "",
    paragraph(
      "We&rsquo;ll email you as soon as we have an update — usually within 24-48 hours."
    ),
    paragraph(
      `If we locate your item, you can unlock the full recovery details for <strong>$${plans.recovery.paymentPrice}</strong>.`
    ),
    paragraph(
      `<strong style="color:#059669;">No item found? You pay nothing.</strong>`
    ),
  ].join("");

  const summaryText = hasSummary
    ? `\n${summaryRows
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}\n`
    : "";

  const bodyText = `Thanks for submitting your lost item report. Our team has received your case and will start searching right away.

Your case reference: ${caseNumber}
(Save this number to track your case.)
${summaryText}
We'll email you as soon as we have an update — usually within 24-48 hours.

If we locate your item, you can unlock the full recovery details for $${plans.recovery.paymentPrice}.
No item found? You pay nothing.`;

  const { html, text } = renderEmail({ greeting, bodyHtml, bodyText, caseNumber });
  return { subject, html, text };
}

export async function sendConfirmationEmail({
  name,
  email,
  caseNumber,
  category,
  itemDescription,
  location,
}) {
  const built = buildConfirmationEmail({
    name,
    caseNumber,
    category,
    itemDescription,
    location,
  });
  await sendViaGmail({ to: email, ...built });
}

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

// ─── Not found ────────────────────────────────────────────────────────────

function buildNotFoundEmail({ name, caseNumber, location, reason }) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Update on your lost item search (${caseNumber})`;
  const area = location ? `${location} area` : "search area";

  const bodyHtml = [
    paragraph(
      `We weren&rsquo;t able to find your item in the ${escapeHtml(
        area
      )} despite our best efforts.`
    ),
    reason ? paragraph(escapeHtml(reason)) : "",
    paragraph(
      `<strong style="color:#059669;">As promised, there is no charge since we did not find your item.</strong>`
    ),
    strongLine("Case reference", caseNumber),
    paragraph("We hope you enjoy the rest of your time in Korea."),
  ].join("");

  const bodyText = `We weren't able to find your item in the ${area} despite our best efforts.${
    reason ? `\n\n${reason}` : ""
  }

As promised, there is no charge since we did not find your item.

Case reference: ${caseNumber}

We hope you enjoy the rest of your time in Korea.`;

  const { html, text } = renderEmail({ greeting, bodyHtml, bodyText, caseNumber });
  return { subject, html, text };
}

export async function sendNotFoundEmail({
  name,
  email,
  caseNumber,
  location,
  reason,
}) {
  const built = buildNotFoundEmail({ name, caseNumber, location, reason });
  await sendViaGmail({ to: email, ...built });
}

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

// ─── Shipping quote ──────────────────────────────────────────────────────

function buildShippingQuoteEmail({
  name,
  caseNumber,
  amount,
  notes,
  shippingAddress,
}) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Shipping quote for your item (${caseNumber})`;

  const rows = [
    ["Shipping cost", `<strong>$${escapeHtml(String(amount))}</strong>`],
  ];
  if (shippingAddress) {
    rows.push([
      "Shipping to",
      `<span style="white-space:pre-wrap;">${escapeHtml(shippingAddress)}</span>`,
    ]);
  }
  if (notes) {
    rows.push([
      "Details",
      `<span style="white-space:pre-wrap;">${escapeHtml(notes)}</span>`,
    ]);
  }
  rows.push([
    "Case reference",
    `<span style="font-family:'SFMono-Regular',Menlo,monospace;">${escapeHtml(
      caseNumber
    )}</span>`,
  ]);

  const bodyHtml = [
    paragraph(
      "We&rsquo;ve prepared a shipping quote to deliver your recovered item."
    ),
    kvList(rows),
  ].join("");

  const bodyText = `We've prepared a shipping quote to deliver your recovered item.

Amount: $${amount}${shippingAddress ? `\nShipping to:\n${shippingAddress}` : ""}${
    notes ? `\n\nDetails:\n${notes}` : ""
  }

Case reference: ${caseNumber}`;

  const { html, text } = renderEmail({ greeting, bodyHtml, bodyText, caseNumber });
  return { subject, html, text };
}

export async function sendShippingQuoteEmail({
  name,
  email,
  caseNumber,
  amount,
  notes,
  shippingAddress,
}) {
  const built = buildShippingQuoteEmail({
    name,
    caseNumber,
    amount,
    notes,
    shippingAddress,
  });
  await sendViaGmail({ to: email, ...built });
}

// ─── Tracking ────────────────────────────────────────────────────────────

function buildTrackingEmail({
  name,
  caseNumber,
  trackingNumber,
  shippingMethod,
  estimatedDelivery,
}) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Your item has shipped (${caseNumber})`;
  const dateStr = estimatedDelivery
    ? new Date(estimatedDelivery).toDateString()
    : null;

  const rows = [
    [
      "Tracking number",
      `<span style="font-family:'SFMono-Regular',Menlo,monospace;">${escapeHtml(
        trackingNumber || "—"
      )}</span>`,
    ],
    ["Shipping method", escapeHtml(shippingMethod || "—")],
  ];
  if (dateStr) rows.push(["Estimated delivery", escapeHtml(dateStr)]);
  rows.push([
    "Case reference",
    `<span style="font-family:'SFMono-Regular',Menlo,monospace;">${escapeHtml(
      caseNumber
    )}</span>`,
  ]);

  const bodyHtml = [
    paragraph("Your item is on its way. Here are the tracking details:"),
    kvList(rows),
  ].join("");

  const bodyText = `Your item is on its way. Here are the tracking details:

Tracking number: ${trackingNumber || "—"}
Shipping method: ${shippingMethod || "—"}${
    dateStr ? `\nEstimated delivery: ${dateStr}` : ""
  }

Case reference: ${caseNumber}`;

  const { html, text } = renderEmail({ greeting, bodyHtml, bodyText, caseNumber });
  return { subject, html, text };
}

export async function sendTrackingEmail({
  name,
  email,
  caseNumber,
  trackingNumber,
  shippingMethod,
  estimatedDelivery,
}) {
  const built = buildTrackingEmail({
    name,
    caseNumber,
    trackingNumber,
    shippingMethod,
    estimatedDelivery,
  });
  await sendViaGmail({ to: email, ...built });
}

export { sendCustomerReplyNotification } from "@/lib/email/templates/customer-reply";
