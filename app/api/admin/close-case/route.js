import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sendNotFoundEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Admin DB client not configured" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { caseNumber, reason } = body || {};
  if (!caseNumber) {
    return Response.json(
      { ok: false, error: "Missing caseNumber" },
      { status: 400 }
    );
  }

  const { data: report, error: lookupError } = await supabaseAdmin
    .from("reports")
    .select("id, name, email, location, activity_log")
    .eq("case_number", caseNumber)
    .maybeSingle();
  if (lookupError) {
    console.error("close-case lookup error:", lookupError);
    return Response.json(
      { ok: false, error: lookupError.message },
      { status: 500 }
    );
  }
  if (!report) {
    return Response.json({ ok: false, error: "Case not found" }, { status: 404 });
  }

  let emailSent = false;
  let emailError = null;
  try {
    await sendNotFoundEmail({
      name: report.name,
      email: report.email,
      caseNumber,
      location: report.location,
      reason: (reason || "").trim(),
    });
    emailSent = true;
  } catch (err) {
    console.error("close-case sendNotFoundEmail failed:", err);
    emailError = err?.message || "Failed to send email";
  }

  const existing = Array.isArray(report.activity_log) ? report.activity_log : [];
  const entry = {
    action: "case_closed_no_item_found",
    timestamp: new Date().toISOString(),
    note: emailSent
      ? `'No item found' email sent to ${report.email}.${
          reason ? ` Reason: ${reason}` : ""
        }`
      : `Case closed without email (send failed: ${emailError}).${
          reason ? ` Reason: ${reason}` : ""
        }`,
  };
  const updatedLog = [entry, ...existing];

  const { error: updateError } = await supabaseAdmin
    .from("reports")
    .update({
      status: "closed",
      activity_log: updatedLog,
    })
    .eq("id", report.id);
  if (updateError) {
    console.error("close-case update error:", updateError);
    return Response.json(
      { ok: false, error: updateError.message, emailSent },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, emailSent, emailError });
}
