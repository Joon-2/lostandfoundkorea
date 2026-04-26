import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

// Shared rendering primitives for every customer-facing email. Kept tight
// so per-template files only describe the body content, not the wrapper.

const WA_URL = siteConfig.whatsapp;
export const SITE_URL = siteConfig.url;
const SITE_HOSTNAME = SITE_URL.replace(/^https?:\/\//, "");
const SITE_NAME = siteConfig.name;
const SITE_LOCATION = siteConfig.location;
const FROM_ADDRESS = `"${SITE_NAME}" <${siteConfig.email}>`;

export function escapeHtml(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Single shared shell every customer-facing email renders into.
// Layout: header banner → greeting → body → footer.
// Footer offers three equivalent contact paths: hit reply, open the
// /reply/[caseNumber] web form, or chat on WhatsApp. caseNumber is
// required so the "respond online" link can resolve.
export function renderEmail({
  greeting,
  bodyHtml,
  bodyText,
  caseNumber,
}: {
  greeting: string;
  bodyHtml: string;
  bodyText: string;
  caseNumber?: string;
}): { html: string; text: string } {
  const replyUrl = caseNumber
    ? `${SITE_URL}/reply/${encodeURIComponent(caseNumber)}`
    : null;

  const footerHtml = replyUrl
    ? `Just reply to this email,
       <a href="${replyUrl}" style="color:#059669;text-decoration:underline;">respond online</a>,
       or
       <a href="${WA_URL}" style="color:#059669;text-decoration:underline;">chat with us on WhatsApp</a>.`
    : `Just reply to this email, or
       <a href="${WA_URL}" style="color:#059669;text-decoration:underline;">chat with us on WhatsApp</a>.`;

  const footerText = replyUrl
    ? `Just reply to this email, respond online (${replyUrl}), or chat with us on WhatsApp: ${WA_URL}`
    : `Just reply to this email, or chat with us on WhatsApp: ${WA_URL}`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a202c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#1e3a5f;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:600;">
          ${escapeHtml(SITE_NAME)}
        </td></tr>
        <tr><td style="padding:32px 28px;font-size:16px;line-height:1.55;color:#1a202c;">
          <p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 28px;background:#f8fafb;border-top:1px solid #e2e8f0;font-size:13px;color:#4a5568;text-align:center;line-height:1.5;">
          ${footerHtml}
          <div style="margin-top:8px;font-size:12px;color:#718096;">
            ${escapeHtml(SITE_NAME)} · ${escapeHtml(SITE_LOCATION)} ·
            <a href="${SITE_URL}" style="color:#718096;text-decoration:underline;">${escapeHtml(SITE_HOSTNAME)}</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `${greeting}

${bodyText}

—
${footerText}

${SITE_NAME} · ${SITE_LOCATION} · ${SITE_HOSTNAME}
`;

  return { html, text };
}

// Centralized send. Every customer-facing email goes through here so the
// reply-to header is consistent: replies always land at support@.
export async function sendViaGmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("Email service not configured");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: FROM_ADDRESS,
    replyTo: siteConfig.email,
    to,
    subject,
    text,
    html,
  });
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 14px;">${html}</p>`;
}

export function strongLine(label: string, value: string): string {
  return `<p style="margin:0 0 14px;"><strong style="color:#1a202c;">${escapeHtml(
    label
  )}:</strong> <span style="font-family:'SFMono-Regular',Menlo,monospace;letter-spacing:0.05em;">${escapeHtml(
    value
  )}</span></p>`;
}

export function kvList(rows: [string, string][]): string {
  const html = rows
    .filter(([, v]) => v != null && v !== "")
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#718096;width:40%;vertical-align:top;border-bottom:1px solid #f1f5f9;">${escapeHtml(
          k
        )}</td>
        <td style="padding:10px 0;font-size:14px;color:#1a202c;text-align:right;vertical-align:top;border-bottom:1px solid #f1f5f9;word-break:break-word;">${v}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;border-collapse:collapse;">${html}</table>`;
}
