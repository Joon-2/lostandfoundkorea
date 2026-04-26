import { capturePayPalOrder, refundPayPalCapture } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logToCaseByCaseNumber } from "@/lib/activity-log";
import { plans } from "@/config/plans";

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

    // Pickup add-on is a single fixed-price product; price is sourced
    // from the server-side plans config so the client can't change it.
    const expectedAmount = plans.pickup_addon.price.toFixed(2);

    const captured = await capturePayPalOrder(orderId);
    const captureStatus = captured?.status;
    if (captureStatus !== "COMPLETED") {
      console.error(
        "pickup-addon capture-order: unexpected status",
        captureStatus,
        captured
      );
      return Response.json(
        { ok: false, error: `Capture status: ${captureStatus}` },
        { status: 502 }
      );
    }

    const captureNode =
      captured?.purchase_units?.[0]?.payments?.captures?.[0];
    const paidAmount = captureNode?.amount?.value;
    const captureId = captureNode?.id;
    if (!paidAmount) {
      console.error(
        "pickup-addon capture-order: capture amount missing",
        captured
      );
      return Response.json(
        { ok: false, error: "Capture amount missing in PayPal response" },
        { status: 502 }
      );
    }
    if (paidAmount !== expectedAmount) {
      console.error("pickup-addon capture-order: amount mismatch", {
        expected: expectedAmount,
        got: paidAmount,
      });
      if (captureId) {
        try {
          await refundPayPalCapture(captureId, {
            reason: `Amount mismatch (expected ${expectedAmount}, captured ${paidAmount})`,
          });
        } catch (refundErr) {
          console.error(
            "pickup-addon capture-order: refund failed",
            refundErr
          );
        }
      }
      return Response.json(
        { ok: false, error: "Captured amount does not match add-on price" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      console.error("pickup-addon capture-order: supabaseAdmin not configured");
      return Response.json({
        ok: true,
        warning: "Payment captured but DB not updated",
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({ pickup_addon_transaction_id: orderId })
      .eq("case_number", caseNumber);
    if (updateError) {
      console.error("pickup-addon capture-order DB update error:", updateError);
      return Response.json({
        ok: true,
        warning: "Payment captured but DB update failed",
        dbError: updateError.message,
      });
    }

    await logToCaseByCaseNumber(caseNumber, {
      action: `Pickup add-on paid ($${plans.pickup_addon.price})`,
      user: "customer",
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("pickup-addon capture-order error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to capture order" },
      { status: 500 }
    );
  }
}
