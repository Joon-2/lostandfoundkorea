import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import {
  sanitizeDeliveryInput,
  pickReportRef,
} from "@/lib/delivery-sanitize";
import type { DeliveryWithReport } from "@/types/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — list deliveries with their source report joined in. Filters:
//   ?status=pending|shipped|...
//   ?carrier=...
//   ?from=YYYY-MM-DD&to=YYYY-MM-DD (created_at)
//   ?report_id=...
export async function GET(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const carrier = url.searchParams.get("carrier");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const reportId = url.searchParams.get("report_id");

  let q = supabaseAdmin
    .from("deliveries")
    .select(
      "*, report:reports!report_id (id, case_number, name, email, status)"
    )
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);
  if (carrier) q = q.eq("carrier", carrier);
  if (reportId) q = q.eq("report_id", reportId);
  if (from) q = q.gte("created_at", from);
  if (to) {
    // Inclusive end-of-day.
    const end = new Date(to);
    end.setUTCHours(23, 59, 59, 999);
    q = q.lte("created_at", end.toISOString());
  }

  const { data, error } = await q;
  if (error) {
    console.error("[deliveries] select error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    deliveries: (data || []) as DeliveryWithReport[],
  });
}

// POST — create a delivery. Body identifies the source report by either
// report_id (UUID) or case_number (LFK-XXXXXX).
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
  const ref = pickReportRef(body);
  if (!ref) {
    return Response.json(
      { ok: false, error: "report_id or case_number is required" },
      { status: 400 }
    );
  }

  // Resolve case_number to report_id if needed.
  let reportId: string;
  if (ref.kind === "id") {
    reportId = ref.report_id;
  } else {
    const { data: report, error } = await supabaseAdmin
      .from("reports")
      .select("id")
      .eq("case_number", ref.case_number)
      .maybeSingle();
    if (error) {
      console.error("[deliveries] report lookup error:", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    if (!report) {
      return Response.json(
        { ok: false, error: `No case found with number ${ref.case_number}` },
        { status: 404 }
      );
    }
    reportId = report.id;
  }

  const fields = sanitizeDeliveryInput(body);
  const insert = { report_id: reportId, status: "pending", ...fields };

  const { data, error } = await supabaseAdmin
    .from("deliveries")
    .insert(insert)
    .select(
      "*, report:reports!report_id (id, case_number, name, email, status)"
    )
    .single();
  if (error) {
    console.error("[deliveries] insert error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, delivery: data as DeliveryWithReport });
}
