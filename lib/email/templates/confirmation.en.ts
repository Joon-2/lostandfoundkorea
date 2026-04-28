import { plans } from "@/config/plans";
import {
  escapeHtml,
  kvList,
  paragraph,
  renderEmail,
  sendViaGmail,
} from "@/lib/email/render";

export function buildConfirmationEmail({
  name,
  caseNumber,
  category,
  itemDescription,
  location,
}: {
  name?: string;
  caseNumber: string;
  category?: string;
  itemDescription?: string;
  location?: string;
}): { subject: string; html: string; text: string } {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `We received your report (${caseNumber})`;

  const summaryRows: [string, string | undefined][] = [
    ["Item", category],
    ["Description", itemDescription],
    ["Last seen", location],
  ];
  const hasSummary = summaryRows.some(([, v]) => v);
  const escapedSummaryRows: [string, string][] = summaryRows.map(([k, v]) => [
    k,
    v ? escapeHtml(v) : "",
  ]);

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
}: {
  name?: string;
  email: string;
  caseNumber: string;
  category?: string;
  itemDescription?: string;
  location?: string;
}): Promise<void> {
  const built = buildConfirmationEmail({
    name,
    caseNumber,
    category,
    itemDescription,
    location,
  });
  await sendViaGmail({ to: email, ...built });
}
