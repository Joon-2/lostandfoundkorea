import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";

const EDITABLE = [
  "status",
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

  const { data, error } = await supabaseAdmin
    .from("reports")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, report: data });
}
