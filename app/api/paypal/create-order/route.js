import { createPayPalOrder } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const PRICE = "39.00";

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
      .select("status")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (error) {
      console.error("create-order DB lookup error:", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    if (!report) {
      return Response.json({ ok: false, error: "Case not found" }, { status: 404 });
    }
    if ((report.status || "pending") !== "found") {
      return Response.json(
        { ok: false, error: "Case is not ready for payment" },
        { status: 400 }
      );
    }

    const order = await createPayPalOrder({
      amount: PRICE,
      caseNumber,
    });
    return Response.json({ ok: true, id: order.id });
  } catch (err) {
    console.error("create-order error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
