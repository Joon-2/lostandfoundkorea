import { capturePayPalOrder } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPlan } from "@/config/plans";

export const runtime = "nodejs";

function stripHtml(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/<[^>]*>/g, "").trim();
  return cleaned || null;
}

function generateCaseNumber() {
  const n = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `LFK-${n}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, plan: planKey, formData } = body || {};
    if (!orderId) {
      return Response.json(
        { ok: false, error: "Missing orderId" },
        { status: 400 }
      );
    }
    const plan = getPlan(planKey);
    if (!plan) {
      return Response.json(
        { ok: false, error: "Unknown plan" },
        { status: 400 }
      );
    }

    const captured = await capturePayPalOrder(orderId);
    if (captured?.status !== "COMPLETED") {
      console.error("checkout/capture: unexpected status", captured?.status, captured);
      return Response.json(
        { ok: false, error: `Capture status: ${captured?.status}` },
        { status: 502 }
      );
    }

    const paidAmount =
      captured?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    if (paidAmount && paidAmount !== plan.price) {
      console.error("checkout/capture: amount mismatch", {
        expected: plan.price,
        got: paidAmount,
      });
      return Response.json(
        { ok: false, error: "Captured amount does not match plan price" },
        { status: 502 }
      );
    }

    if (!supabaseAdmin) {
      console.error("checkout/capture: supabaseAdmin not configured");
      return Response.json(
        { ok: true, warning: "Payment captured but DB not updated" }
      );
    }

    const f = formData || {};
    const name = stripHtml(f.fullName);
    const email = stripHtml(f.email);
    if (!name || !email || !EMAIL_RE.test(email)) {
      console.error("checkout/capture: invalid form data", { name, email });
      return Response.json(
        {
          ok: false,
          error: "Payment captured, but form data was invalid. Contact support.",
        },
        { status: 400 }
      );
    }

    const caseNumber = generateCaseNumber();
    const payload = {
      case_number: caseNumber,
      name,
      email,
      item_description: stripHtml(f.itemDescription),
      location: stripHtml(f.location),
      location_detail: stripHtml(f.locationDetail),
      shipping_address: stripHtml(f.shippingAddress),
      status: "paid",
      process_stage: plan.process_stage,
      paypal_transaction_id: orderId,
    };

    const { error: dbError } = await supabaseAdmin
      .from("reports")
      .insert(payload);
    if (dbError) {
      console.error("checkout/capture insert failed:", dbError);
      return Response.json(
        {
          ok: false,
          error: "Payment captured but report could not be saved",
          debug: dbError.message,
        },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, caseNumber });
  } catch (err) {
    console.error("checkout/capture error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Failed to capture order" },
      { status: 500 }
    );
  }
}
