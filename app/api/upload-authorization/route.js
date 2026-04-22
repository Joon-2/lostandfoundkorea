import { supabaseAdmin } from "@/lib/supabase-admin";
import { logToCaseByCaseNumber } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "authorizations";
const MAX_BYTES = 10 * 1024 * 1024;

function maskIdNumber(raw) {
  const s = (raw || "").trim();
  if (!s) return "";
  if (s.length <= 4) return `${"•".repeat(s.length)}`;
  return `${"•".repeat(s.length - 4)}${s.slice(-4)}`;
}

function safeFilename(name) {
  return (name || "authorization")
    .replace(/[^a-z0-9.\-_]/gi, "_")
    .slice(0, 120);
}

export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return Response.json(
        { ok: false, error: "Server not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const caseNumber = formData.get("caseNumber");
    const legalName = (formData.get("legalName") || "").toString().trim();
    const idNumber = (formData.get("idNumber") || "").toString().trim();
    const authorized = formData.get("authorized") === "true";
    const shippingStreet = (formData.get("shippingStreet") || "").toString().trim();
    const shippingCity = (formData.get("shippingCity") || "").toString().trim();
    const shippingCountry = (formData.get("shippingCountry") || "").toString().trim();
    const shippingPostalCode = (formData.get("shippingPostalCode") || "")
      .toString()
      .trim();

    if (!file || typeof file === "string" || !caseNumber) {
      return Response.json(
        { ok: false, error: "Missing file or caseNumber" },
        { status: 400 }
      );
    }
    if (!legalName || !idNumber) {
      return Response.json(
        { ok: false, error: "Missing legal name or ID number" },
        { status: 400 }
      );
    }
    if (!authorized) {
      return Response.json(
        { ok: false, error: "Authorization checkbox must be accepted" },
        { status: 400 }
      );
    }
    if (
      !shippingStreet ||
      !shippingCity ||
      !shippingCountry ||
      !shippingPostalCode
    ) {
      return Response.json(
        { ok: false, error: "Missing shipping address fields" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return Response.json(
        { ok: false, error: "File is larger than 10 MB" },
        { status: 400 }
      );
    }

    const { data: report, error: lookupError } = await supabaseAdmin
      .from("reports")
      .select("id, status")
      .eq("case_number", caseNumber)
      .maybeSingle();
    if (lookupError) {
      console.error("upload-authorization lookup error:", lookupError);
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
    if (report.status !== "paid") {
      return Response.json(
        { ok: false, error: "Upload is only available after payment" },
        { status: 400 }
      );
    }

    const path = `${caseNumber}/${Date.now()}-${safeFilename(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploaded, error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      console.error("upload-authorization upload error:", uploadError);
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
    const publicUrl = publicData?.publicUrl || null;

    const shippingAddress = [
      shippingStreet,
      `${shippingCity} ${shippingPostalCode}`.trim(),
      shippingCountry,
    ]
      .filter(Boolean)
      .join("\n");

    const updatePayload = { shipping_address: shippingAddress };
    if (publicUrl) updatePayload.authorization_url = publicUrl;
    await supabaseAdmin.from("reports").update(updatePayload).eq("id", report.id);

    await logToCaseByCaseNumber(caseNumber, {
      action: `Authorization submitted — name: ${legalName}, ID: ${maskIdNumber(
        idNumber
      )}, shipping to ${shippingCity}, ${shippingCountry}`,
      user: "customer",
    });

    return Response.json({ ok: true, path: uploaded.path, url: publicUrl });
  } catch (err) {
    console.error("upload-authorization threw:", err);
    return Response.json(
      { ok: false, error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
