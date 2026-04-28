// TODO: Translate to Japanese — currently a verbatim copy of shipping-quote.en.ts.
// When real Japanese copy lands, edit this file directly; the loader
// in lib/email/dispatcher.ts picks it up by filename.

import {
  escapeHtml,
  kvList,
  paragraph,
  renderEmail,
  sendViaGmail,
} from "@/lib/email/render";

export function buildShippingQuoteEmail({
  name,
  caseNumber,
  amount,
  notes,
  shippingAddress,
}: {
  name?: string;
  caseNumber: string;
  amount: string | number;
  notes?: string;
  shippingAddress?: string;
}): { subject: string; html: string; text: string } {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Shipping quote for your item (${caseNumber})`;

  const rows: [string, string][] = [
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
}: {
  name?: string;
  email: string;
  caseNumber: string;
  amount: string | number;
  notes?: string;
  shippingAddress?: string;
}): Promise<void> {
  const built = buildShippingQuoteEmail({
    name,
    caseNumber,
    amount,
    notes,
    shippingAddress,
  });
  await sendViaGmail({ to: email, ...built });
}
