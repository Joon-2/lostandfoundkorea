import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { sanitizeDeliveryInput } from "@/lib/delivery-sanitize";
import { buildLogEntry } from "@/lib/activity-log";
import type { DeliveryWithReport } from "@/types/delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — single delivery + linked report.
export async function GET(
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
  const { data, error } = await supabaseAdmin
    .from("deliveries")
    .select(
      "*, report:reports!report_id (id, case_number, name, email, status)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[deliveries/:id] get error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
  if (!data) {
    return Response.json(
      { ok: false, error: "Delivery not found" },
      { status: 404 }
    );
  }
  return Response.json({ ok: true, delivery: data as DeliveryWithReport });
}

// PUT — update fields. Side effect: when status flips to 'delivered',
// also flip the linked report's status to 'closed' and append an entry
// to its activity_log. Other status transitions don't propagate.
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
  const update = sanitizeDeliveryInput(body);
  if (Object.keys(update).length === 0) {
    return Response.json(
      { ok: false, error: "No editable fields supplied" },
      { status: 400 }
    );
  }

  // Capture current status to detect a delivered transition.
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("deliveries")
    .select("id, status, report_id")
    .eq("id", id)
    .maybeSingle();
  if (lookupError) {
    console.error("[deliveries/:id] lookup error:", lookupError);
    return Response.json(
      { ok: false, error: lookupError.message },
      { status: 500 }
    );
  }
  if (!existing) {
    return Response.json(
      { ok: false, error: "Delivery not found" },
      { status: 404 }
    );
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("deliveries")
    .update(update)
    .eq("id", id)
    .select(
      "*, report:reports!report_id (id, case_number, name, email, status)"
    )
    .single();
  if (updateError || !updated) {
    console.error("[deliveries/:id] update error:", updateError);
    return Response.json(
      { ok: false, error: updateError?.message || "Update failed" },
      { status: 500 }
    );
  }

  const becameDelivered =
    update.status === "delivered" && existing.status !== "delivered";

  if (becameDelivered) {
    // Flip the linked report to 'closed' and write an activity entry.
    const { data: report, error: rError } = await supabaseAdmin
      .from("reports")
      .select("id, activity_log, status")
      .eq("id", existing.report_id)
      .maybeSingle();
    if (rError) {
      console.error("[deliveries/:id] report lookup error:", rError);
    } else if (report) {
      const existingLog = Array.isArray(report.activity_log)
        ? report.activity_log
        : [];
      const nextLog = [
        buildLogEntry({
          action: `Closed via delivery completion (${updated.tracking_number || "no tracking"})`,
          user: "system",
        }),
        ...existingLog,
      ];
      const { error: rUpdateError } = await supabaseAdmin
        .from("reports")
        .update({ status: "closed", activity_log: nextLog })
        .eq("id", report.id);
      if (rUpdateError) {
        console.error(
          "[deliveries/:id] report status sync error:",
          rUpdateError
        );
      }
    }
  }

  return Response.json({
    ok: true,
    delivery: updated as DeliveryWithReport,
    reportSynced: becameDelivered,
  });
}

// DELETE — remove a delivery. Doesn't touch the linked report.
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
    .from("deliveries")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[deliveries/:id] delete error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}
