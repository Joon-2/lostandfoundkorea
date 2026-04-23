import nodemailer from "nodemailer";
import { buildConfirmationEmail } from "@/lib/email";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";

export async function POST(request) {
  console.log("Email API called");

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, caseNumber, category, itemDescription, location } =
      body || {};
    console.log("Email API payload:", {
      name,
      email,
      caseNumber,
      category,
      itemDescription,
      location,
    });

    if (!email || !caseNumber) {
      console.error("Email API missing fields", { email, caseNumber });
      return Response.json(
        { ok: false, error: "Missing email or caseNumber" },
        { status: 400 }
      );
    }

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    console.log("GMAIL_USER:", user);
    console.log("GMAIL_APP_PASSWORD set?", Boolean(pass));

    if (!user || !pass) {
      console.error("Email API: GMAIL_USER or GMAIL_APP_PASSWORD not configured");
      return Response.json(
        { ok: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    console.log("Creating transporter...");
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

    console.log("Sending email to:", email);
    const info = await transporter.sendMail({
      from: `"${siteConfig.name}" <${siteConfig.email}>`,
      to: email,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully", {
      messageId: info?.messageId,
      response: info?.response,
    });

    return Response.json({ ok: true, messageId: info?.messageId });
  } catch (error) {
    console.error("Email error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return Response.json(
      { ok: false, error: error?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
