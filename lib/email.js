import nodemailer from "nodemailer";

function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildConfirmationEmail({
  name,
  caseNumber,
  category,
  itemDescription,
  location,
}) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `We received your report (${caseNumber})`;

  const summaryLines = [];
  if (category) summaryLines.push(`Item: ${category}`);
  if (itemDescription) summaryLines.push(`Description: ${itemDescription}`);
  if (location) summaryLines.push(`Last seen: ${location}`);
  const summaryText = summaryLines.length
    ? `\n${summaryLines.join("\n")}\n`
    : "";

  const text = `${greeting}

Thanks for submitting your lost item report to Lost and Found Korea. Our team has received your case and will start searching right away.

Your case reference: ${caseNumber}
(Save this number to track your case.)
${summaryText}
We'll email you as soon as we have an update — usually within 24-48 hours.

If we locate your item, you can unlock the full recovery details for $39.
No item found? You pay nothing.

Need urgent help? Chat with us on WhatsApp: https://wa.me/821044921349

—
Lost and Found Korea · Seoul, Korea · lostandfoundkorea.com
`;

  const summaryHtml =
    summaryLines.length > 0
      ? `<div style="margin:0 0 24px;padding:16px 20px;background:#f8fafb;border:1px solid #e2e8f0;border-radius:12px;">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#718096;margin-bottom:8px;">Your submission</div>
          ${
            category
              ? `<div style="font-size:14px;color:#4a5568;margin:2px 0;"><strong style="color:#1a202c;">Item:</strong> ${escapeHtml(category)}</div>`
              : ""
          }
          ${
            itemDescription
              ? `<div style="font-size:14px;color:#4a5568;margin:2px 0;"><strong style="color:#1a202c;">Description:</strong> ${escapeHtml(itemDescription)}</div>`
              : ""
          }
          ${
            location
              ? `<div style="font-size:14px;color:#4a5568;margin:2px 0;"><strong style="color:#1a202c;">Last seen:</strong> ${escapeHtml(location)}</div>`
              : ""
          }
        </div>`
      : "";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a202c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#1e3a5f;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:600;">
          Lost &amp; Found Korea
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;color:#1a202c;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#4a5568;">
            Thanks for submitting your lost item report. Our team has received your case and will start searching right away.
          </p>
          <div style="margin:24px 0;padding:16px 20px;background:#f8fafb;border:1px solid #e2e8f0;border-radius:12px;">
            <div style="font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#718096;">Case reference</div>
            <div style="margin-top:4px;font-family:'SFMono-Regular',Menlo,monospace;font-size:22px;font-weight:600;color:#1a202c;letter-spacing:0.06em;">${escapeHtml(caseNumber)}</div>
            <div style="margin-top:6px;font-size:12px;color:#718096;">Save this number to track your case.</div>
          </div>
          ${summaryHtml}
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#4a5568;">
            We&rsquo;ll email you as soon as we have an update &mdash; usually within 24-48 hours.
          </p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.55;color:#4a5568;">
            If we locate your item, you can unlock the full recovery details for <strong style="color:#1a202c;">$39</strong>.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#4a5568;">
            <strong style="color:#059669;">No item found? You pay nothing.</strong>
          </p>
          <p style="margin:0 0 8px;font-size:14px;color:#4a5568;">Need urgent help?</p>
          <p style="margin:0;">
            <a href="https://wa.me/821044921349" style="display:inline-block;background:#25D366;color:#ffffff;padding:12px 22px;border-radius:9999px;text-decoration:none;font-weight:500;font-size:14px;">Chat with us on WhatsApp</a>
          </p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f8fafb;border-top:1px solid #e2e8f0;font-size:12px;color:#718096;text-align:center;">
          Lost and Found Korea &middot; Seoul, Korea &middot; <a href="https://lostandfoundkorea.com" style="color:#718096;text-decoration:underline;">lostandfoundkorea.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}

export async function sendConfirmationEmail({ name, email, caseNumber }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email service not configured");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const { subject, text, html } = buildConfirmationEmail({ name, caseNumber });
  await transporter.sendMail({
    from: `Lost and Found Korea <${user}>`,
    to: email,
    subject,
    text,
    html,
  });
}

function buildPaymentEmail({ name, caseNumber }) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Your item has been found (${caseNumber})`;
  const link = `https://lostandfoundkorea.com/pay/${caseNumber}`;

  const text = `${greeting}

Your item has been found! Pay $39 to unlock recovery details.

Open this link to complete the payment:
${link}

Once paid, you'll see the exact recovery location, contact phone, operating hours, and step-by-step English pickup instructions.

Reminder: if the item turns out not to be yours, you pay nothing.

Need urgent help? Chat with us on WhatsApp: https://wa.me/821044921349

—
Lost and Found Korea · Seoul, Korea · lostandfoundkorea.com
`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a202c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#1e3a5f;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:600;">
          Lost &amp; Found Korea
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;color:#1a202c;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 16px;font-size:18px;font-weight:600;line-height:1.4;color:#1a202c;">
            Your item has been found! Pay $39 to unlock recovery details.
          </p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#4a5568;">
            Case reference: <strong style="color:#1a202c;font-family:'SFMono-Regular',Menlo,monospace;">${escapeHtml(caseNumber)}</strong>
          </p>
          <p style="margin:24px 0;">
            <a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:15px;">Pay $39 to unlock</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#718096;">Or copy this link into your browser:<br>
            <a href="${link}" style="color:#4a5568;word-break:break-all;">${link}</a>
          </p>
          <p style="margin:16px 0 0;font-size:14px;line-height:1.55;color:#4a5568;">
            Once paid, you'll see the exact recovery location, contact phone, operating hours, and step-by-step English pickup instructions.
          </p>
          <p style="margin:16px 0 0;font-size:14px;color:#4a5568;">
            <strong style="color:#059669;">Reminder:</strong> if the item turns out not to be yours, you pay nothing.
          </p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f8fafb;border-top:1px solid #e2e8f0;font-size:12px;color:#718096;text-align:center;">
          Lost and Found Korea &middot; Seoul, Korea &middot; <a href="https://lostandfoundkorea.com" style="color:#718096;text-decoration:underline;">lostandfoundkorea.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}

export async function sendPaymentEmail({ name, email, caseNumber }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email service not configured");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const { subject, text, html } = buildPaymentEmail({ name, caseNumber });
  await transporter.sendMail({
    from: `Lost and Found Korea <${user}>`,
    to: email,
    subject,
    text,
    html,
  });
}
