import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { buildLogEntry } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only image upload to the "found-images" bucket. Accepts multipart
// form-data with `file` (Blob) and `caseNumber` (string). Appends the public
// URL to the case's found_images array and writes an activity-log entry.
// Existing callers use /api/admin/upload-found-image; this is the canonical
// endpoint going forward.

const BUCKET = "found-images";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 5;

function errorToPlain(err: any) {
  if (!err) return null;
  const plain = {
    message: err.message,
    name: err.name,
    statusCode: err.statusCode,
    code: err.code,
    hint: err.hint,
    details: err.details,
  };
  try {
    return { ...plain, ...JSON.parse(JSON.stringify(err)) };
  } catch {
    return plain;
  }
}

export async function POST(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    console.error(
      "[upload] supabaseAdmin null — check SUPABASE_SERVICE_ROLE_KEY"
    );
    return Response.json(
      {
        ok: false,
        error: "Server not configured",
        debug: "SUPABASE_SERVICE_ROLE_KEY missing on server",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const caseNumber = formData.get("caseNumber");

    if (!file || typeof file === "string" || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing file or caseNumber" },
        { status: 400 }
      );
    }
    if (file.type && !file.type.startsWith("image/")) {
      return Response.json(
        { ok: false, error: "Not an image", debug: `type=${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return Response.json(
        {
          ok: false,
          error: "File is larger than 5 MB after compression",
          debug: `size=${file.size}`,
        },
        { status: 400 }
      );
    }

    const { data: report, error: lookupError } = await supabaseAdmin
      .from("reports")
      .select("id, found_images, activity_log")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (lookupError) {
      console.error("[upload] DB lookup error:", errorToPlain(lookupError));
      return Response.json(
        { ok: false, error: lookupError.message, debug: errorToPlain(lookupError) },
        { status: 500 }
      );
    }
    if (!report) {
      return Response.json(
        { ok: false, error: "Case not found" },
        { status: 404 }
      );
    }

    const existingImages: string[] = Array.isArray(report.found_images)
      ? report.found_images
      : [];
    if (existingImages.length >= MAX_PHOTOS) {
      return Response.json(
        { ok: false, error: `Maximum ${MAX_PHOTOS} photos per case` },
        { status: 400 }
      );
    }

    const path = `${caseNumber}-${Date.now()}.jpg`;
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());

    const { data: uploaded, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });
    if (uploadError) {
      console.error("[upload] storage error:", errorToPlain(uploadError));
      return Response.json(
        {
          ok: false,
          error: uploadError.message || "Storage upload failed",
          hint: `Ensure a '${BUCKET}' bucket exists in Supabase Storage.`,
          bucket: BUCKET,
          debug: errorToPlain(uploadError),
        },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(uploaded.path);
    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) {
      console.error("[upload] no public URL for", uploaded.path);
      return Response.json(
        { ok: false, error: "Could not resolve public URL for upload" },
        { status: 500 }
      );
    }

    const nextImages = [...existingImages, publicUrl];
    const existingLog = Array.isArray(report.activity_log)
      ? report.activity_log
      : [];
    const nextLog = [
      buildLogEntry({ action: "Found item photo uploaded" }),
      ...existingLog,
    ];

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("reports")
      .update({ found_images: nextImages, activity_log: nextLog })
      .eq("id", report.id)
      .select("id, found_images")
      .single();
    if (updateError) {
      console.error("[upload] DB update error:", errorToPlain(updateError));
      return Response.json(
        { ok: false, error: updateError.message, debug: errorToPlain(updateError) },
        { status: 500 }
      );
    }

    const persisted = Array.isArray(updated?.found_images)
      ? updated.found_images
      : nextImages;

    return Response.json(
      { ok: true, url: publicUrl, images: persisted },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[upload] threw:", errorToPlain(err));
    return Response.json(
      { ok: false, error: err?.message || "Upload failed", debug: errorToPlain(err) },
      { status: 500 }
    );
  }
}
