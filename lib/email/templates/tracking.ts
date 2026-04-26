import {
  escapeHtml,
  kvList,
  paragraph,
  renderEmail,
  sendViaGmail,
} from "@/lib/email/render";

export function buildTrackingEmail({
  name,
  caseNumber,
  trackingNumber,
  shippingMethod,
  estimatedDelivery,
}: {
  name?: string;
  caseNumber: string;
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
}): { subject: string; html: string; text: string } {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Your item has shipped (${caseNumber})`;
  const dateStr = estimatedDelivery
    ? new Date(estimatedDelivery).toDateString()
    : null;

  const rows: [string, string][] = [
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
}: {
  name?: string;
  email: string;
  caseNumber: string;
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
}): Promise<void> {
  const built = buildTrackingEmail({
    name,
    caseNumber,
    trackingNumber,
    shippingMethod,
    estimatedDelivery,
  });
  await sendViaGmail({ to: email, ...built });
}
