import { sendPaymentEmail } from "@/lib/email";
import { checkAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { REPORT_PLAN_LABELS, getReportPlanPrice } from "@/lib/report-plans";
import { logToCaseByCaseNumber } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { name, email, caseNumber } = body || {};
    if (!email || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing email or caseNumber" },
        { status: 400 }
      );
    }

    let plan = "recovery";
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("reports")
        .select("plan")
        .eq("case_number", caseNumber)
        .maybeSingle();
      if (data?.plan === "all_in_one") plan = "all_in_one";
    }

    const amount = getReportPlanPrice(plan).replace(/\.00$/, "");
    const planLabel = REPORT_PLAN_LABELS[plan];

    await sendPaymentEmail({ name, email, caseNumber, amount, planLabel });
    await logToCaseByCaseNumber(caseNumber, {
      action: "Payment link email sent",
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("send-payment error:", err);
    return Response.json(
      { ok: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
