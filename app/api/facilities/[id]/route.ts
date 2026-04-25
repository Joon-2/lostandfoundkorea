import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sanitizeFacilityInput } from "@/lib/facility-sanitize";
import type { Facility, FacilityUpdate } from "@/types/facility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT — update a facility by id (admin only). Same field whitelist as
// create; partial updates are fine since only fields present in the body
// are written.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Partial<FacilityUpdate>;
  const update = sanitizeFacilityInput(body);
  if (!Object.keys(update).length) {
    return Response.json(
      { ok: false, error: "No editable fields supplied" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("facilities")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[facilities/:id] update error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, facility: data as Facility });
}

// DELETE — remove a facility by id (admin only).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("facilities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[facilities/:id] delete error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
