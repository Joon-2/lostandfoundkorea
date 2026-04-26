import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sanitizeLeadInput } from "@/lib/lead-sanitize";
import type { Lead } from "@/types/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT — partial update. Whitelisted fields only. Trigger maintains
// updated_at server-side.
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
  const body = await request.json().catch(() => ({}));
  const update = sanitizeLeadInput(body);
  if (Object.keys(update).length === 0) {
    return Response.json(
      { ok: false, error: "No editable fields supplied" },
      { status: 400 }
    );
  }
  if (update.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
    return Response.json(
      { ok: false, error: "Invalid email format" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[leads/:id] update error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
  return Response.json({ ok: true, lead: data as Lead });
}

// DELETE — remove a lead.
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
  const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
  if (error) {
    console.error("[leads/:id] delete error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}
