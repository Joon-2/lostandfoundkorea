import { sendConfirmationEmail } from "@/lib/email";
import { checkAdminAuth } from "@/lib/admin-auth";
import { logToCaseByCaseNumber } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, caseNumber, category, itemDescription, location } =
      body || {};
    if (!email || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing email or caseNumber" },
        { status: 400 }
      );
    }
    await sendConfirmationEmail({
      name,
      email,
      caseNumber,
      category,
      itemDescription,
      location,
    });
    await logToCaseByCaseNumber(caseNumber, {
      action: `Confirmation email sent to ${email}`,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("admin send-confirmation error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to send" },
      { status: 500 }
    );
  }
}
