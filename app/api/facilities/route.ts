import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sanitizeFacilityInput } from "@/lib/facility-sanitize";
import type { Facility, FacilityInsert } from "@/types/facility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — list facilities. Admin password ⇒ all rows; otherwise only the
// active ones (this endpoint is also what the public /coverage pages
// hit, and we never want inactive entries to leak there).
export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    console.error("[facilities] supabaseAdmin not configured");
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const isAdmin = checkAdminAuth(request) === null;

  let query = supabaseAdmin
    .from("facilities")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (!isAdmin) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[facilities] select error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    facilities: (data || []) as Facility[],
  });
}

// POST — create a facility (admin only).
export async function POST(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as Partial<FacilityInsert>;
  if (!body.category || !body.name) {
    return Response.json(
      { ok: false, error: "category and name are required" },
      { status: 400 }
    );
  }

  const insert = sanitizeFacilityInput(body);

  const { data, error } = await supabaseAdmin
    .from("facilities")
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error("[facilities] insert error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, facility: data as Facility });
}

