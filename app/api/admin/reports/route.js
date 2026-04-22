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

  const headers = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

  if (error) {
    console.error("[admin/reports] select error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500, headers }
    );
  }

  const rows = data || [];
  console.log(
    "[admin/reports] rows:",
    rows.length,
    "— found_images summary:",
    rows.map((r) => ({
      id: r.id,
      case_number: r.case_number,
      found_images: Array.isArray(r.found_images)
        ? r.found_images.length
        : typeof r.found_images,
    }))
  );

  return Response.json({ ok: true, reports: rows }, { headers });
}
