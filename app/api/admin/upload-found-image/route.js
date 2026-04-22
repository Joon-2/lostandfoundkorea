import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { buildLogEntry } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "found-images";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 5;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeFilename(name) {
  return (name || "photo").replace(/[^a-z0-9.\-_]/gi, "_").slice(0, 120);
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
    const formData = await request.formData();
    const file = formData.get("file");
    const caseNumber = formData.get("caseNumber");

    if (!file || typeof file === "string" || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing file or caseNumber" },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { ok: false, error: "Only JPG, PNG, or WebP images are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return Response.json(
        { ok: false, error: "File is larger than 5 MB" },
        { status: 400 }
      );
    }

    const { data: report, error: lookupError } = await supabaseAdmin
      .from("reports")
      .select("id, found_images, activity_log")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (lookupError) {
      console.error("upload-found-image lookup error:", lookupError);
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
    if (existingImages.length >= MAX_PHOTOS) {
      return Response.json(
        { ok: false, error: `Maximum ${MAX_PHOTOS} photos per case` },
        { status: 400 }
      );
    }

    const name = safeFilename(file.name);
    const path = `${caseNumber}/${Date.now()}-${name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploaded, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      console.error("upload-found-image upload error:", uploadError);
      return Response.json(
        {
          ok: false,
          error: uploadError.message,
          hint: `Ensure a '${BUCKET}' bucket exists in Supabase Storage.`,
        },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(uploaded.path);
    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) {
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

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        found_images: nextImages,
        activity_log: nextLog,
      })
      .eq("id", report.id);
    if (updateError) {
      console.error("upload-found-image update error:", updateError);
      return Response.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, url: publicUrl, images: nextImages });
  } catch (err) {
    console.error("upload-found-image threw:", err);
    return Response.json(
      { ok: false, error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
