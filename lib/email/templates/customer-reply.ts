import { siteConfig } from "@/config/site";
import { SITE_URL, escapeHtml, sendViaGmail } from "@/lib/email/render";

// Internal alert sent to support@ whenever a customer submits the
// /reply/[caseNumber] form. Plain inline HTML — no customer-facing
// wrapper since this isn't sent to customers. The reply itself lives in
// reports.messages JSONB; this is just the heads-up.

export async function sendCustomerReplyNotification({
  caseNumber,
  customerName,
  customerEmail,
  text: replyText,
  attachmentUrl,
}: {
  caseNumber: string;
  customerName?: string;
  customerEmail?: string;
  text?: string;
  attachmentUrl?: string;
}): Promise<void> {
  const safeText = escapeHtml(replyText || "").replace(/\n/g, "<br>");
  const adminUrl = `${SITE_URL}/admin?case=${encodeURIComponent(caseNumber)}`;

  const subject = `New reply from customer [${caseNumber}]`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a202c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
        <tr><td>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#1a202c;white-space:pre-wrap;">${safeText || "<em style=\"color:#718096;\">(no message)</em>"}</p>
          ${
            attachmentUrl
              ? `<p style="margin:0 0 16px;font-size:14px;color:#4a5568;">Customer also attached a file — view it in admin dashboard.</p>`
              : ""
          }
          <p style="margin:16px 0 0;font-size:14px;"><a href="${adminUrl}" style="color:#059669;text-decoration:underline;">Open case ${escapeHtml(
            caseNumber
          )} in admin</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `${replyText || "(no message)"}${
    attachmentUrl
      ? "\n\nCustomer also attached a file — view it in admin dashboard."
      : ""
  }

Open case ${caseNumber} in admin: ${adminUrl}
`;

  await sendViaGmail({ to: siteConfig.email, subject, html, text });
}
