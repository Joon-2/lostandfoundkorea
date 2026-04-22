import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Admin DB client not configured (SUPABASE_SERVICE_ROLE_KEY missing)" },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, reports: data || [] });
}
