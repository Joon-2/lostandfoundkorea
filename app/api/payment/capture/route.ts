import type { NextRequest } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Customer-facing PayPal capture endpoint. Accepts { orderId, caseNumber }
// and marks the case as paid. Existing granular endpoints
// (/api/paypal/capture-order, /api/paypal/checkout/capture,
// /api/paypal/pickup-addon/capture-order) remain in place for their
// specific flows — this is the canonical capture path per CLAUDE.md for
// the standard recovery-payment capture, which is by far the common case.

export async function POST(request: NextRequest) {
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
      console.error(
        "[payment/capture] unexpected status",
        captureStatus,
        captured
      );
      return Response.json(
        { ok: false, error: `Capture status: ${captureStatus}` },
        { status: 502 }
      );
    }

    if (!supabaseAdmin) {
      console.error("[payment/capture] supabaseAdmin not configured");
      return Response.json({
        ok: true,
        warning: "Payment captured but DB not updated",
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        status: "paid",
        paypal_transaction_id: orderId,
      })
      .eq("case_number", caseNumber);
    if (updateError) {
      console.error("[payment/capture] DB update error:", updateError);
      return Response.json({
        ok: true,
        warning: "Payment captured but DB update failed",
        dbError: updateError.message,
      });
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error("[payment/capture] error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to capture order" },
      { status: 500 }
    );
  }
}
