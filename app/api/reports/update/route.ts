import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { buildLogEntry } from "@/lib/activity-log";
import { getStageLabel } from "@/lib/process-stages";
import type { Report } from "@/types/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only: update a report by case_number. Whitelists editable fields,
// appends activity-log entries for stage / recovery-detail changes. Mirrors
// the PATCH semantics of /api/admin/reports/[id] but takes a case number in
// the body so callers don't need to know the internal UUID.

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
] as const;

const RECOVERY_FIELDS = [
  "recovery_location",
  "recovery_contact",
  "recovery_hours",
  "recovery_instructions",
] as const;

export async function POST(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    console.error("[reports/update] supabaseAdmin not configured");
    return Response.json(
      { ok: false, error: "Admin DB client not configured" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const caseNumber: string | undefined = body?.caseNumber;
  const updates: Record<string, any> = body?.updates || {};

  if (!caseNumber) {
    return Response.json(
      { ok: false, error: "Missing caseNumber" },
      { status: 400 }
    );
  }

  const update: Record<string, any> = {};
  for (const k of EDITABLE) {
    if (k in updates) {
      const v = updates[k];
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
    .select("id, process_stage, activity_log")
    .eq("case_number", caseNumber)
    .maybeSingle();
  if (lookupError) {
    console.error("[reports/update] lookup error:", lookupError);
    return Response.json(
      { ok: false, error: lookupError.message },
      { status: 500 }
    );
  }
  if (!current) {
    return Response.json(
      { ok: false, error: "Case not found" },
      { status: 404 }
    );
  }

  const existingLog = Array.isArray(current.activity_log)
    ? current.activity_log
    : [];
  const stageChanged =
    "process_stage" in update &&
    update.process_stage !== current.process_stage;
  const recoveryChanged = RECOVERY_FIELDS.some((k) => k in update);

  const newEntries: any[] = [];
  if (stageChanged) {
    newEntries.push(
      buildLogEntry({
        action: `Stage changed to ${getStageLabel(update.process_stage)}`,
      })
    );
  }
  if (recoveryChanged) {
    newEntries.push(buildLogEntry({ action: "Recovery details updated" }));
  }
  const newLog = [...newEntries, ...existingLog];

  const { data, error } = await supabaseAdmin
    .from("reports")
    .update({ ...update, activity_log: newLog })
    .eq("id", current.id)
    .select()
    .single();

  const headers = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

  if (error) {
    console.error("[reports/update] update error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500, headers }
    );
  }

  return Response.json(
    { ok: true, report: data as Report },
    { headers }
  );
}
