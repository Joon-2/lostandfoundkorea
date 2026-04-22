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

export async function sendConfirmationEmail({
  name,
  email,
  caseNumber,
  category,
  itemDescription,
  location,
}) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email service not configured");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const { subject, text, html } = buildConfirmationEmail({
    name,
    caseNumber,
    category,
    itemDescription,
    location,
  });
  await transporter.sendMail({
    from: `Lost and Found Korea <${user}>`,
    to: email,
    subject,
    text,
    html,
  });
}

function buildPaymentEmail({ name, caseNumber, amount = "39", planLabel = "" }) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Your item has been found (${caseNumber})`;
  const link = `https://lostandfoundkorea.com/pay/${caseNumber}`;
  const planSuffix = planLabel ? ` (${planLabel})` : "";

  const text = `${greeting}

Your item has been found! Pay $${amount} to unlock recovery details${planSuffix}.

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
            Your item has been found! Pay $${amount} to unlock recovery details${planLabel ? ` (${escapeHtml(planLabel)})` : ""}.
          </p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#4a5568;">
            Case reference: <strong style="color:#1a202c;font-family:'SFMono-Regular',Menlo,monospace;">${escapeHtml(caseNumber)}</strong>
          </p>
          <p style="margin:24px 0;">
            <a href="${link}" style="display:inline-block;background:#059669;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:15px;">Pay $${amount} to unlock</a>
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

function buildNotFoundEmail({ name, caseNumber, location, reason }) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Update on your lost item search (${caseNumber})`;
  const area = location ? `${location} area` : "search area";
  const reasonLine = reason ? `\n\n${reason}` : "";

  const text = `${greeting}

We weren't able to find your item in the ${area} despite our best efforts.${reasonLine}

As promised, there is no charge since we did not find your item.

If you have any new information that might help, reply to this email or chat with us on WhatsApp: https://wa.me/821044921349

We hope you enjoy the rest of your time in Korea.

—
Lost and Found Korea · https://lostandfoundkorea.com
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
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#4a5568;">
            We weren&rsquo;t able to find your item in the ${escapeHtml(area)} despite our best efforts.
          </p>
          ${
            reason
              ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#4a5568;">${escapeHtml(reason)}</p>`
              : ""
          }
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#4a5568;">
            <strong style="color:#059669;">As promised, there is no charge since we did not find your item.</strong>
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#4a5568;">
            If you have any new information that might help, reply to this email or chat with us on WhatsApp.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#4a5568;">
            We hope you enjoy the rest of your time in Korea.
          </p>
          <p style="margin:0;">
            <a href="https://wa.me/821044921349" style="display:inline-block;background:#25D366;color:#ffffff;padding:12px 22px;border-radius:9999px;text-decoration:none;font-weight:500;font-size:14px;">Chat with us on WhatsApp</a>
          </p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f8fafb;border-top:1px solid #e2e8f0;font-size:12px;color:#718096;text-align:center;">
          Lost and Found Korea &middot; <a href="https://lostandfoundkorea.com" style="color:#718096;text-decoration:underline;">lostandfoundkorea.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}

export async function sendNotFoundEmail({ name, email, caseNumber, location, reason }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email service not configured");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const { subject, text, html } = buildNotFoundEmail({
    name,
    caseNumber,
    location,
    reason,
  });
  await transporter.sendMail({
    from: '"Lost and Found Korea" <support@lostandfoundkorea.com>',
    to: email,
    subject,
    text,
    html,
  });
}

function buildInfoRequestEmail({ name, caseNumber, infoText }) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Quick question about your lost item (${caseNumber})`;
  const waLink = "https://wa.me/821044921349";

  const text = `${greeting}

Thanks for your report. To help us find your item faster, could you provide:

${infoText}

Reply to this email or chat with us on WhatsApp: ${waLink}

Case reference: ${caseNumber}

—
Lost and Found Korea · lostandfoundkorea.com
`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a202c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#ffffff;padding:20px 28px;color:#1a202c;font-size:18px;font-weight:700;border-bottom:1px solid #e5e7eb;">
          Lost &amp; Found Korea
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;color:#1a202c;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#4a5568;">
            Thanks for your report. To help us find your item faster, could you provide:
          </p>
          <div style="margin:20px 0;padding:16px 20px;background:#f8fafb;border-left:3px solid #059669;border-radius:8px;font-size:15px;line-height:1.6;color:#1a202c;white-space:pre-wrap;">${escapeHtml(infoText)}</div>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#4a5568;">
            Reply to this email or chat with us on WhatsApp.
          </p>
          <p style="margin:16px 0;">
            <a href="${waLink}" style="display:inline-block;background:#25D366;color:#ffffff;padding:12px 22px;border-radius:9999px;text-decoration:none;font-weight:500;font-size:14px;">Chat on WhatsApp</a>
          </p>
          <p style="margin:16px 0 0;font-size:13px;color:#718096;">
            Case reference: <strong style="color:#1a202c;font-family:'SFMono-Regular',Menlo,monospace;">${escapeHtml(caseNumber)}</strong>
          </p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f8fafb;border-top:1px solid #e2e8f0;font-size:12px;color:#718096;text-align:center;">
          Lost and Found Korea &middot; <a href="https://lostandfoundkorea.com" style="color:#718096;text-decoration:underline;">lostandfoundkorea.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}

export async function sendInfoRequestEmail({ name, email, caseNumber, infoText }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email service not configured");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const { subject, text, html } = buildInfoRequestEmail({
    name,
    caseNumber,
    infoText,
  });
  await transporter.sendMail({
    from: `Lost and Found Korea <${user}>`,
    to: email,
    subject,
    text,
    html,
  });
}

function buildReceiptEmail({ name, caseNumber, amount, transactionId, paidAt, planLabel }) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const subject = `Payment receipt (${caseNumber})`;
  const dateStr = new Date(paidAt || Date.now()).toUTCString();
  const planLine = planLabel ? ` (${planLabel})` : "";

  const text = `${greeting}

Thanks for your payment. Here's your receipt:

Case reference: ${caseNumber}
Amount paid: $${amount}${planLine}
Transaction ID: ${transactionId}
Date: ${dateStr}

Recovery details are available at https://lostandfoundkorea.com/pay/${caseNumber}

Need urgent help? Chat with us on WhatsApp: https://wa.me/821044921349

—
Lost and Found Korea · Seoul, Korea · lostandfoundkorea.com
`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a202c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#ffffff;padding:20px 28px;color:#1a202c;font-size:18px;font-weight:700;border-bottom:1px solid #e5e7eb;">
          Lost &amp; Found Korea
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;color:#1a202c;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#4a5568;">
            Thanks for your payment. Here&rsquo;s your receipt.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <tr><td style="padding:12px 16px;font-size:13px;color:#718096;background:#f8fafb;border-bottom:1px solid #e5e7eb;">Case reference</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a202c;background:#f8fafb;border-bottom:1px solid #e5e7eb;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;">${escapeHtml(caseNumber)}</td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;color:#718096;border-bottom:1px solid #e5e7eb;">Amount paid</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a202c;border-bottom:1px solid #e5e7eb;font-weight:600;text-align:right;">$${escapeHtml(String(amount))}${planLabel ? ` <span style="font-weight:400;color:#718096;">(${escapeHtml(planLabel)})</span>` : ""}</td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;color:#718096;border-bottom:1px solid #e5e7eb;background:#f8fafb;">Transaction ID</td>
                <td style="padding:12px 16px;font-size:12px;color:#1a202c;border-bottom:1px solid #e5e7eb;background:#f8fafb;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;word-break:break-all;">${escapeHtml(transactionId)}</td></tr>
            <tr><td style="padding:12px 16px;font-size:13px;color:#718096;">Date</td>
                <td style="padding:12px 16px;font-size:14px;color:#1a202c;text-align:right;">${escapeHtml(dateStr)}</td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:14px;line-height:1.55;color:#4a5568;">
            Recovery details are available on your case page.
          </p>
          <p style="margin:16px 0 0;">
            <a href="https://lostandfoundkorea.com/pay/${encodeURIComponent(caseNumber)}" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 22px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px;">Open case page</a>
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

export async function sendReceiptEmail({ name, email, caseNumber, amount, transactionId, paidAt, planLabel }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email service not configured");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const { subject, text, html } = buildReceiptEmail({
    name,
    caseNumber,
    amount,
    transactionId,
    paidAt,
    planLabel,
  });
  await transporter.sendMail({
    from: `Lost and Found Korea <${user}>`,
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendPaymentEmail({ name, email, caseNumber, amount, planLabel }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Email service not configured");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const { subject, text, html } = buildPaymentEmail({
    name,
    caseNumber,
    amount,
    planLabel,
  });
  await transporter.sendMail({
    from: `Lost and Found Korea <${user}>`,
    to: email,
    subject,
    text,
    html,
  });
}
