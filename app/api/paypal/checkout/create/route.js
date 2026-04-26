import { createPayPalOrder } from "@/lib/paypal";
import { getPlan } from "@/config/plans";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan = getPlan(body.plan);
    if (!plan) {
      return Response.json(
        { ok: false, error: "Unknown plan" },
        { status: 400 }
      );
    }
    const reference = `LFK-CHK-${plan.process_stage.toUpperCase()}-${Date.now()}`;
    const order = await createPayPalOrder({
      amount: plan.price,
      caseNumber: reference,
    });
    return Response.json({ ok: true, id: order.id });
  } catch (err) {
    console.error("checkout/create error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
