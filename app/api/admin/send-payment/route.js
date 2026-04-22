import { sendPaymentEmail } from "@/lib/email";
import { checkAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { name, email, caseNumber } = body || {};
    if (!email || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing email or caseNumber" },
        { status: 400 }
      );
    }
    await sendPaymentEmail({ name, email, caseNumber });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("send-payment error:", err);
    return Response.json(
      { ok: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
