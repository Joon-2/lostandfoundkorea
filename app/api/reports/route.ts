import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import type { Report } from "@/types/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only list endpoint. Returns every report, newest-first.
// Password protection via x-admin-password header (checkAdminAuth).
// Existing callers still use /api/admin/reports; this is the canonical
// endpoint going forward per CLAUDE.md.
export async function GET(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    console.error("[reports] supabaseAdmin not configured");
    return Response.json(
      {
        ok: false,
        error:
          "Admin DB client not configured (SUPABASE_SERVICE_ROLE_KEY missing)",
      },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  const headers = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

  if (error) {
    console.error("[reports] select error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500, headers }
    );
  }

  return Response.json(
    { ok: true, reports: (data || []) as Report[] },
    { headers }
  );
}
