import type { NextRequest } from "next/server";
import { capturePayPalOrder, refundPayPalCapture } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getReportPlanPrice } from "@/config/plans";

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

    // Look up the plan server-side so the expected amount can't be
    // tampered with by the client.
    let expectedAmount: string | null = null;
    if (supabaseAdmin) {
      const { data: report } = await supabaseAdmin
        .from("reports")
        .select("plan")
        .eq("case_number", caseNumber)
        .maybeSingle();
      if (!report) {
        return Response.json(
          { ok: false, error: "Case not found" },
          { status: 404 }
        );
      }
      expectedAmount = getReportPlanPrice(report.plan);
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

    const captureNode =
      captured?.purchase_units?.[0]?.payments?.captures?.[0];
    const paidAmount: string | undefined = captureNode?.amount?.value;
    const captureId: string | undefined = captureNode?.id;
    if (!paidAmount) {
      console.error("[payment/capture] capture amount missing", captured);
      return Response.json(
        { ok: false, error: "Capture amount missing in PayPal response" },
        { status: 502 }
      );
    }
    if (expectedAmount && paidAmount !== expectedAmount) {
      console.error("[payment/capture] amount mismatch", {
        expected: expectedAmount,
        got: paidAmount,
      });
      if (captureId) {
        try {
          await refundPayPalCapture(captureId, {
            reason: `Amount mismatch (expected ${expectedAmount}, captured ${paidAmount})`,
          });
        } catch (refundErr) {
          console.error("[payment/capture] refund failed", refundErr);
        }
      }
      return Response.json(
        { ok: false, error: "Captured amount does not match plan price" },
        { status: 400 }
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
