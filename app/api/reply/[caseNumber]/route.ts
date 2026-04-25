import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendCustomerReplyNotification } from "@/lib/email";
import { buildLogEntry } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "report-images";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_TEXT = 4000;

// Customer-facing reply endpoint. No admin auth — knowledge of the case
// number is the access token, same model as /pay/[caseNumber] and
// /api/upload-authorization. Appends to reports.messages (JSONB array)
// and emails support@.

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
const rateLimit = new Map<string, number[]>();

function getIp(request: NextRequest) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function checkRate(ip: string) {
  const now = Date.now();
  const arr = (rateLimit.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_REQUESTS) {
    rateLimit.set(ip, arr);
    return false;
  }
  arr.push(now);
  rateLimit.set(ip, arr);
  return true;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseNumber: string }> }
) {
  const { caseNumber } = await params;

  if (!supabaseAdmin) {
    console.error("[reply] supabaseAdmin not configured");
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const ip = getIp(request);
  if (!checkRate(ip)) {
    return Response.json(
      { ok: false, error: "Too many replies from this network. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const text = String(formData.get("text") || "").trim();
    const file = formData.get("file");

    if (!text && (!file || typeof file === "string")) {
      return Response.json(
        { ok: false, error: "Please write a message or attach a file." },
        { status: 400 }
      );
    }
    if (text.length > MAX_TEXT) {
      return Response.json(
        { ok: false, error: `Message is too long (max ${MAX_TEXT} chars).` },
        { status: 400 }
      );
    }

    const { data: report, error: lookupError } = await supabaseAdmin
      .from("reports")
      .select("id, name, email, messages, activity_log")
      .eq("case_number", caseNumber)
      .maybeSingle();

    if (lookupError) {
      console.error("[reply] lookup error:", lookupError);
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

    let attachmentUrl: string | null = null;
    if (file && typeof file !== "string") {
      if (file.size > MAX_BYTES) {
        return Response.json(
          { ok: false, error: "File is larger than 10 MB." },
          { status: 400 }
        );
      }
      const ext =
        file.name && file.name.includes(".")
          ? file.name.split(".").pop()
          : "bin";
      const path = `reply-${caseNumber}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { data: uploaded, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) {
        console.error("[reply] storage upload error:", uploadError);
        return Response.json(
          { ok: false, error: uploadError.message || "Upload failed" },
          { status: 500 }
        );
      }
      const { data: publicData } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(uploaded.path);
      attachmentUrl = publicData?.publicUrl || null;
    }

    const newMessage = {
      from: "customer" as const,
      text,
      attachment_url: attachmentUrl,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const existingMessages = Array.isArray(report.messages) ? report.messages : [];
    const nextMessages = [...existingMessages, newMessage];

    const existingLog = Array.isArray(report.activity_log)
      ? report.activity_log
      : [];
    const nextLog = [
      buildLogEntry({
        action: "Customer replied online",
        user: report.name || "customer",
      }),
      ...existingLog,
    ];

    const { error: updateError } = await supabaseAdmin
      .from("reports")
      .update({ messages: nextMessages, activity_log: nextLog })
      .eq("id", report.id);
    if (updateError) {
      console.error("[reply] update error:", updateError);
      return Response.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Fire-and-forget notification — don't fail the user's submit if the
    // mail step throws.
    sendCustomerReplyNotification({
      caseNumber,
      customerName: report.name,
      customerEmail: report.email,
      text,
      attachmentUrl,
    }).catch((err: any) =>
      console.error("[reply] notification email failed:", err)
    );

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error("[reply] threw:", err);
    return Response.json(
      { ok: false, error: err?.message || "Submit failed" },
      { status: 500 }
    );
  }
}
