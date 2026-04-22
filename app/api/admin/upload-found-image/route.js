import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import { buildLogEntry } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "found-images";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 5;

function ok(body) {
  return Response.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
function fail(body, status) {
  return Response.json(
    { ok: false, ...body },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function errorToPlain(err) {
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

export async function POST(request) {
  console.log("[upload-found-image] request received");

  const denied = checkAdminAuth(request);
  if (denied) {
    console.log("[upload-found-image] auth denied");
    return denied;
  }

  if (!supabaseAdmin) {
    console.error(
      "[upload-found-image] supabaseAdmin is null — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
    return fail(
      {
        error: "Server not configured",
        debug: "SUPABASE_SERVICE_ROLE_KEY missing on server",
      },
      500
    );
  }
  console.log("[upload-found-image] supabaseAdmin configured, bucket:", BUCKET);

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const caseNumber = formData.get("caseNumber");
    console.log("[upload-found-image] file info:", {
      hasFile: !!file && typeof file !== "string",
      name: file?.name,
      size: file?.size,
      type: file?.type,
      caseNumber,
    });

    if (!file || typeof file === "string" || !caseNumber) {
      return fail({ error: "Missing file or caseNumber" }, 400);
    }
    if (file.type && !file.type.startsWith("image/")) {
      return fail({ error: "Not an image", debug: `type=${file.type}` }, 400);
    }
    if (file.size > MAX_BYTES) {
      return fail(
        {
          error: "File is larger than 5 MB after compression",
          debug: `size=${file.size}`,
        },
        400
      );
    }

    const { data: report, error: lookupError } = await supabaseAdmin
      .from("reports")
      .select("id, found_images, activity_log")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (lookupError) {
      console.error(
        "[upload-found-image] DB lookup error:",
        JSON.stringify(errorToPlain(lookupError))
      );
      return fail(
        {
          error: lookupError.message,
          debug: errorToPlain(lookupError),
        },
        500
      );
    }
    if (!report) {
      console.log("[upload-found-image] case not found:", caseNumber);
      return fail({ error: "Case not found" }, 404);
    }
    console.log("[upload-found-image] report found, id:", report.id);

    const existingImages = Array.isArray(report.found_images)
      ? report.found_images
      : [];
    if (existingImages.length >= MAX_PHOTOS) {
      return fail({ error: `Maximum ${MAX_PHOTOS} photos per case` }, 400);
    }

    const path = `${caseNumber}-${Date.now()}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(
      "[upload-found-image] uploading to storage:",
      `${BUCKET}/${path}`,
      "bytes:",
      buffer.byteLength
    );

    const { data: uploaded, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: "image/jpeg",
        upsert: false,
      });
    if (uploadError) {
      const plain = errorToPlain(uploadError);
      console.error(
        "[upload-found-image] storage upload error FULL:",
        JSON.stringify(plain, null, 2)
      );
      return fail(
        {
          error: uploadError.message || "Storage upload failed",
          hint: `Ensure a '${BUCKET}' bucket exists in Supabase Storage.`,
          bucket: BUCKET,
          debug: plain,
        },
        500
      );
    }
    console.log("[upload-found-image] storage upload OK, path:", uploaded.path);

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(uploaded.path);
    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) {
      console.error(
        "[upload-found-image] could not resolve public URL for",
        uploaded.path
      );
      return fail(
        { error: "Could not resolve public URL for upload" },
        500
      );
    }
    console.log("[upload-found-image] public URL:", publicUrl);

    const nextImages = [...existingImages, publicUrl];
    const existingLog = Array.isArray(report.activity_log)
      ? report.activity_log
      : [];
    const nextLog = [
      buildLogEntry({ action: "Found item photo uploaded" }),
      ...existingLog,
    ];

    console.log(
      "[upload-found-image] DB update: reports.update({found_images, activity_log}).eq('id',",
      report.id,
      ") — new array length:",
      nextImages.length
    );
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        found_images: nextImages,
        activity_log: nextLog,
      })
      .eq("id", report.id)
      .select("id, found_images")
      .single();
    if (updateError) {
      const plain = errorToPlain(updateError);
      console.error(
        "[upload-found-image] DB update error FULL:",
        JSON.stringify(plain, null, 2)
      );
      return fail(
        { error: updateError.message, debug: plain },
        500
      );
    }
    console.log(
      "[upload-found-image] DB update OK, verified found_images length:",
      Array.isArray(updated?.found_images) ? updated.found_images.length : "NOT ARRAY",
      "contains new url:",
      Array.isArray(updated?.found_images) &&
        updated.found_images.includes(publicUrl)
    );

    const persisted = Array.isArray(updated?.found_images)
      ? updated.found_images
      : nextImages;

    if (!persisted.includes(publicUrl)) {
      console.error(
        "[upload-found-image] WARNING: DB round-trip did not include the new URL.",
        { expected: publicUrl, got: persisted }
      );
    }

    return ok({ ok: true, url: publicUrl, images: persisted });
  } catch (err) {
    const plain = errorToPlain(err);
    console.error(
      "[upload-found-image] threw:",
      JSON.stringify(plain, null, 2)
    );
    return fail(
      { error: err?.message || "Upload failed", debug: plain },
      500
    );
  }
}
