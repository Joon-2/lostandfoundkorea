import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { buildLogEntry } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "found-images";

function pathFromPublicUrl(url) {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return url.substring(idx + marker.length);
}

export async function POST(request) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { caseNumber, url } = body || {};
    if (!caseNumber || !url) {
      return Response.json(
        { ok: false, error: "Missing caseNumber or url" },
        { status: 400 }
      );
    }

    const { data: report, error: lookupError } = await supabaseAdmin
      .from("reports")
      .select("id, found_images, activity_log")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (lookupError) {
      console.error("delete-found-image lookup error:", lookupError);
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

    const existingImages = Array.isArray(report.found_images)
      ? report.found_images
      : [];
    const nextImages = existingImages.filter((u) => u !== url);

    const storagePath = pathFromPublicUrl(url);
    if (storagePath) {
      const { error: removeError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove([storagePath]);
      if (removeError) {
        console.error("delete-found-image storage remove error:", removeError);
      }
    }

    const existingLog = Array.isArray(report.activity_log)
      ? report.activity_log
      : [];
    const nextLog = [
      buildLogEntry({ action: "Found item photo deleted" }),
      ...existingLog,
    ];

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        found_images: nextImages,
        activity_log: nextLog,
      })
      .eq("id", report.id);
    if (updateError) {
      console.error("delete-found-image update error:", updateError);
      return Response.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, images: nextImages });
  } catch (err) {
    console.error("delete-found-image threw:", err);
    return Response.json(
      { ok: false, error: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}
