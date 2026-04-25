import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Marks every customer message on a case as read=true. Called by the
// admin CaseDetail when it mounts and detects unread customer messages,
// so the case-list badge clears as soon as the admin opens the case.

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
  const caseNumber: string | undefined = body?.caseNumber;
  if (!caseNumber) {
    return Response.json(
      { ok: false, error: "Missing caseNumber" },
      { status: 400 }
    );
  }

  const { data: report, error: lookupError } = await supabaseAdmin
    .from("reports")
    .select("id, messages")
    .eq("case_number", caseNumber)
    .maybeSingle();
  if (lookupError) {
    console.error("[messages/mark-read] lookup:", lookupError);
    return Response.json(
      { ok: false, error: lookupError.message },
      { status: 500 }
    );
  }
  if (!report) {
    return Response.json(
      { ok: false, error: "Case not found" },
      { status: 404 }
    );
  }

  const messages = Array.isArray(report.messages) ? report.messages : [];
  const next = messages.map((m: any) =>
    m && m.from === "customer" && !m.read ? { ...m, read: true } : m
  );

  const { data, error } = await supabaseAdmin
    .from("reports")
    .update({ messages: next })
    .eq("id", report.id)
    .select()
    .single();
  if (error) {
    console.error("[messages/mark-read] update:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, report: data });
}
