import { sendShippingQuoteEmail } from "@/lib/email";
import { checkAdminAuth } from "@/lib/admin-auth";
import { logToCaseByCaseNumber } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const {
      name,
      email,
      caseNumber,
      amount,
      notes,
      shippingAddress,
    } = body || {};
    if (!email || !caseNumber || amount == null || amount === "") {
      return Response.json(
        { ok: false, error: "Missing email, caseNumber, or amount" },
        { status: 400 }
      );
    }
    await sendShippingQuoteEmail({
      name,
      email,
      caseNumber,
      amount,
      notes,
      shippingAddress,
    });
    await logToCaseByCaseNumber(caseNumber, {
      action: `Shipping quote emailed to ${email}: $${amount}`,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("send-shipping-quote error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to send quote" },
      { status: 500 }
    );
  }
}
