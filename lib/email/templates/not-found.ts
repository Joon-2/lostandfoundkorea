import {
  escapeHtml,
  paragraph,
  renderEmail,
  sendViaGmail,
  strongLine,
} from "@/lib/email/render";

export function buildNotFoundEmail({
  name,
  caseNumber,
  location,
  reason,
}: {
  name?: string;
  caseNumber: string;
  location?: string;
  reason?: string;
}): { subject: string; html: string; text: string } {
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
}: {
  name?: string;
  email: string;
  caseNumber: string;
  location?: string;
  reason?: string;
}): Promise<void> {
  const built = buildNotFoundEmail({ name, caseNumber, location, reason });
  await sendViaGmail({ to: email, ...built });
}
