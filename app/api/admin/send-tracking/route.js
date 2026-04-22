import { sendTrackingEmail } from "@/lib/email";
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
      trackingNumber,
      shippingMethod,
      estimatedDelivery,
    } = body || {};
    if (!email || !caseNumber || !trackingNumber) {
      return Response.json(
        { ok: false, error: "Missing email, caseNumber, or trackingNumber" },
        { status: 400 }
      );
    }
    await sendTrackingEmail({
      name,
      email,
      caseNumber,
      trackingNumber,
      shippingMethod,
      estimatedDelivery,
    });
    await logToCaseByCaseNumber(caseNumber, {
      action: `Tracking info emailed to ${email} (${shippingMethod || "shipment"}: ${trackingNumber})`,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("send-tracking error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to send tracking" },
      { status: 500 }
    );
  }
}
