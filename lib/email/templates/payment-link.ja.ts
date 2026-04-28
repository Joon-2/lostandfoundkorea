// TODO: Translate to Japanese — currently a verbatim copy of payment-link.en.ts.
// When real Japanese copy lands, edit this file directly; the loader
// in lib/email/dispatcher.ts picks it up by filename.

import { plans } from "@/config/plans";
import {
  SITE_URL,
  escapeHtml,
  paragraph,
  renderEmail,
  sendViaGmail,
  strongLine,
} from "@/lib/email/render";

export function buildPaymentEmail({
  name,
  caseNumber,
  amount = String(plans.recovery.paymentPrice),
  planLabel = "",
}: {
  name?: string;
  caseNumber: string;
  amount?: string | number;
  planLabel?: string;
}): { subject: string; html: string; text: string } {
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
}: {
  name?: string;
  email: string;
  caseNumber: string;
  amount?: string | number;
  planLabel?: string;
}): Promise<void> {
  const built = buildPaymentEmail({ name, caseNumber, amount, planLabel });
  await sendViaGmail({ to: email, ...built });
}
