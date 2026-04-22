import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { buildLogEntry } from "@/lib/activity-log";
import { getStageLabel } from "@/lib/process-stages";

export const runtime = "nodejs";

const EDITABLE = [
  "status",
  "process_stage",
  "recovery_location",
  "recovery_contact",
  "recovery_hours",
  "recovery_instructions",
  "tracking_number",
  "shipping_method",
  "estimated_delivery",
  "pickup_scheduled_at",
  "shipping_quote_amount",
  "shipping_quote_notes",
];

const RECOVERY_FIELDS = [
  "recovery_location",
  "recovery_contact",
  "recovery_hours",
  "recovery_instructions",
];

export async function PATCH(request, { params }) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Admin DB client not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const update = {};
  for (const k of EDITABLE) {
    if (k in body) {
      const v = body[k];
      update[k] = typeof v === "string" ? v.trim() || null : v;
    }
  }
  if (!Object.keys(update).length) {
    return Response.json(
      { ok: false, error: "No editable fields supplied" },
      { status: 400 }
    );
  }

  const { data: current, error: lookupError } = await supabaseAdmin
    .from("reports")
    .select("status, process_stage, activity_log")
    .eq("id", id)
    .maybeSingle();
  if (lookupError) {
    console.error("PATCH report lookup error:", lookupError);
  }
  const existingLog = Array.isArray(current?.activity_log)
    ? current.activity_log
    : [];

  const stageChanged =
    "process_stage" in update &&
    update.process_stage !== current?.process_stage;
  const recoveryChanged = RECOVERY_FIELDS.some((k) => k in update);

  const newEntries = [];
  if (stageChanged) {
    newEntries.push(
      buildLogEntry({
        action: `Stage changed to ${getStageLabel(update.process_stage)}`,
      })
    );
  }
  if (recoveryChanged) {
    newEntries.push(
      buildLogEntry({ action: "Recovery details updated" })
    );
  }
  const newLog = [...newEntries, ...existingLog];

  const { data, error } = await supabaseAdmin
    .from("reports")
    .update({ ...update, activity_log: newLog })
    .eq("id", id)
    .select()
    .single();

  const headers = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

  if (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500, headers }
    );
  }

  return Response.json({ ok: true, report: data }, { headers });
}
