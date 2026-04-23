import { createPayPalOrder } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { plans } from "@/config/plans";

export const runtime = "nodejs";

const ADDON_AMOUNT = plans.pickup_addon.price.toFixed(2);

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { caseNumber } = body || {};
    if (!caseNumber) {
      return Response.json(
        { ok: false, error: "Missing caseNumber" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return Response.json(
        { ok: false, error: "Server not configured" },
        { status: 500 }
      );
    }

    const { data: report, error } = await supabaseAdmin
      .from("reports")
      .select("status, plan, pickup_addon_transaction_id")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (error) {
      console.error("pickup-addon create-order lookup error:", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    if (!report) {
      return Response.json(
        { ok: false, error: "Case not found" },
        { status: 404 }
      );
    }
    if (report.status !== "paid") {
      return Response.json(
        { ok: false, error: "Pickup add-on is only available after the recovery payment" },
        { status: 400 }
      );
    }
    if (report.plan === "all_in_one") {
      return Response.json(
        {
          ok: false,
          error: "Pickup is already included in the All-in-One plan",
        },
        { status: 400 }
      );
    }
    if (report.pickup_addon_transaction_id) {
      return Response.json(
        { ok: false, error: "Pickup add-on already paid" },
        { status: 400 }
      );
    }

    const order = await createPayPalOrder({
      amount: ADDON_AMOUNT,
      caseNumber: `${caseNumber}-PICKUP`,
    });
    return Response.json({ ok: true, id: order.id });
  } catch (err) {
    console.error("pickup-addon create-order error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
