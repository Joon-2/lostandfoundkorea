import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sanitizeLeadInput, generateLeadNumber } from "@/lib/lead-sanitize";
import type { Lead } from "@/types/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — list every lead, newest first. Admin-protected.
export async function GET(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    console.error("[leads] supabaseAdmin not configured");
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[leads] select error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, leads: (data || []) as Lead[] });
}

// POST — create a new lead. company_name is required; lead_number,
// status, and partner_type get sensible defaults.
export async function POST(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const fields = sanitizeLeadInput(body);

  if (!fields.company_name) {
    return Response.json(
      { ok: false, error: "company_name is required" },
      { status: 400 }
    );
  }
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return Response.json(
      { ok: false, error: "Invalid email format" },
      { status: 400 }
    );
  }

  const insert = {
    lead_number: generateLeadNumber(),
    status: "lead",
    partner_type: "insurance",
    ...fields,
  };

  const { data, error } = await supabaseAdmin
    .from("leads")
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error("[leads] insert error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, lead: data as Lead });
}
