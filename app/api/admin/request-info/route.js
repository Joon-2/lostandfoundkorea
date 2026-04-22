import { sendInfoRequestEmail } from "@/lib/email";
import { checkAdminAuth } from "@/lib/admin-auth";
import { logToCaseByCaseNumber } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, caseNumber, infoText } = body || {};
    const trimmed = (infoText || "").trim();
    if (!email || !caseNumber || !trimmed) {
      return Response.json(
        { ok: false, error: "Missing email, caseNumber, or infoText" },
        { status: 400 }
      );
    }
    await sendInfoRequestEmail({
      name,
      email,
      caseNumber,
      infoText: trimmed,
    });
    const preview = trimmed.length > 140 ? `${trimmed.slice(0, 140)}…` : trimmed;
    await logToCaseByCaseNumber(caseNumber, {
      action: `Info request sent to ${email}: "${preview}"`,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("admin request-info error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to send" },
      { status: 500 }
    );
  }
}
