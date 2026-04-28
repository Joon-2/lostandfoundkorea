import { escapeHtml, renderEmail, sendViaGmail } from "@/lib/email/render";

// The admin's message IS the body — no preamble, no case-ref appendix,
// no formatting commands. The standard wrapper handles greeting and
// footer; the subject already carries the case number.

export function buildInfoRequestEmail({
  name,
  caseNumber,
  infoText,
}: {
  name?: string;
  caseNumber: string;
  infoText?: string;
}): { subject: string; html: string; text: string } {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Quick question about your lost item (${caseNumber})`;
  const escapedInfo = escapeHtml(infoText || "").replace(/\n/g, "<br>");

  const bodyHtml = `<p style="margin:0;color:#1a202c;white-space:pre-wrap;">${escapedInfo}</p>`;
  const bodyText = String(infoText || "");

  const { html, text } = renderEmail({ greeting, bodyHtml, bodyText, caseNumber });
  return { subject, html, text };
}

export async function sendInfoRequestEmail({
  name,
  email,
  caseNumber,
  infoText,
}: {
  name?: string;
  email: string;
  caseNumber: string;
  infoText?: string;
}): Promise<void> {
  const built = buildInfoRequestEmail({ name, caseNumber, infoText });
  await sendViaGmail({ to: email, ...built });
}
