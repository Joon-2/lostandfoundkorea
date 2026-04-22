import { capturePayPalOrder } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, caseNumber } = body || {};
    if (!orderId || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing orderId or caseNumber" },
        { status: 400 }
      );
    }

    const captured = await capturePayPalOrder(orderId);
    const captureStatus = captured?.status;
    if (captureStatus !== "COMPLETED") {
      console.error("capture-order: unexpected status", captureStatus, captured);
      return Response.json(
        { ok: false, error: `Capture status: ${captureStatus}` },
        { status: 502 }
      );
    }

    if (!supabaseAdmin) {
      console.error("capture-order: supabaseAdmin not configured");
      return Response.json(
        { ok: true, warning: "Payment captured but DB not updated" }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        status: "paid",
        paypal_transaction_id: orderId,
      })
      .eq("case_number", caseNumber);
    if (updateError) {
      console.error("capture-order DB update error:", updateError);
      return Response.json(
        {
          ok: true,
          warning: "Payment captured but DB update failed",
          dbError: updateError.message,
        }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("capture-order error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to capture order" },
      { status: 500 }
    );
  }
}
