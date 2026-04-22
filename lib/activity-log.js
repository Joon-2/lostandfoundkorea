import { supabaseAdmin } from "@/lib/supabase-admin";

export function buildLogEntry({ action, note, user = "admin" }) {
  return {
    action,
    timestamp: new Date().toISOString(),
    user,
    ...(note ? { note } : {}),
  };
}

export async function logToCaseByCaseNumber(caseNumber, entry) {
  if (!supabaseAdmin) return;
  try {
    const { data: row, error: lookupError } = await supabaseAdmin
      .from("reports")
      .select("id, activity_log")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (lookupError || !row) {
      console.error("activity log lookup failed:", lookupError, caseNumber);
      return;
    }
    const existing = Array.isArray(row.activity_log) ? row.activity_log : [];
    const updated = [buildLogEntry(entry), ...existing];
    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({ activity_log: updated })
      .eq("id", row.id);
    if (updateError) {
      console.error("activity log update failed:", updateError, caseNumber);
    }
  } catch (err) {
    console.error("logToCaseByCaseNumber threw:", err);
  }
}
