import type { NextRequest } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import type { EmailPayload } from "@/types/email";

export const runtime = "nodejs";

// Unified email endpoint. Dispatches on EmailPayload.type to the right
// template+sender pair via lib/email.ts → sendEmail(). Two categories:
//   - PUBLIC_TYPES: transactional, called from user-facing flows (report
//     submission → confirmation; successful payment → receipt). No admin
//     password required; just a valid EmailPayload.
//   - admin types (payment_link, not_found, info_request, shipping_quote,
//     tracking) require the x-admin-password header.

const PUBLIC_TYPES: EmailPayload["type"][] = ["confirmation", "receipt"];

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<EmailPayload>;
  const type = body?.type;
  const to = body?.to;
  const caseNumber = body?.caseNumber;

  if (!type || !to || !caseNumber) {
    return Response.json(
      { ok: false, error: "Missing type, to, or caseNumber" },
      { status: 400 }
    );
  }

  if (!PUBLIC_TYPES.includes(type)) {
    const denied = checkAdminAuth(request);
    if (denied) return denied;
  }

  try {
    await sendEmail({
      to,
      subject: body.subject || "",
      type,
      caseNumber,
      data: body.data || {},
    });
    return Response.json({ ok: true });
  } catch (err: any) {
    console.error("[email] send failed:", err);
    return Response.json(
      { ok: false, error: err?.message || "Email send failed" },
      { status: 500 }
    );
  }
}
