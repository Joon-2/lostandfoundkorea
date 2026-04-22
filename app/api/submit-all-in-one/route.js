import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;
const rateLimit = new Map();

function getIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function checkRate(ip) {
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

function stripHtml(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/<[^>]*>/g, "").trim();
  return cleaned || null;
}

function generateCaseNumber() {
  const n = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `LFK-${n}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const ip = getIp(request);
    if (!checkRate(ip)) {
      return Response.json(
        {
          ok: false,
          error: "Too many submissions from this network. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (!supabase) {
      return Response.json(
        { ok: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const name = stripHtml(body.fullName);
    const email = stripHtml(body.email);
    const itemDescription = stripHtml(body.itemDescription);
    const location = stripHtml(body.location);
    const shippingAddress = stripHtml(body.shippingAddress);
    const additionalInfo = stripHtml(body.notes);
    const category = body.itemCategory;
    const dateLost = body.date;

    if (
      !name ||
      !email ||
      !category ||
      !itemDescription ||
      !location ||
      !dateLost ||
      !shippingAddress
    ) {
      return Response.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json(
        { ok: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    const caseNumber = generateCaseNumber();

    const payload = {
      name,
      email,
      category,
      item_description: itemDescription,
      location,
      date_lost: dateLost,
      shipping_address: shippingAddress,
      additional_info: additionalInfo,
      case_number: caseNumber,
      status: "pending",
      process_stage: "all_in_one_requested",
    };

    const { error: dbError } = await supabase.from("reports").insert(payload);
    if (dbError) {
      console.error("submit-all-in-one insert failed:", {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code,
        payloadKeys: Object.keys(payload),
      });
      return Response.json(
        {
          ok: false,
          error: "Failed to save request",
          debug: dbError.message,
          code: dbError.code,
          hint: dbError.hint,
        },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, caseNumber });
  } catch (err) {
    console.error("submit-all-in-one error:", err);
    return Response.json(
      { ok: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
