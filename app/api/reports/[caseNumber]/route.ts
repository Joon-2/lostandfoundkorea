import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Report } from "@/types/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Customer-facing case lookup: no admin auth (the case-number URL is the
// access token). Returns a trimmed Report shape whose detail level depends
// on status — we only expose recovery details once the case is paid.

function noStore(body: any, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      ...(init?.headers || {}),
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseNumber: string }> }
) {
  const { caseNumber } = await params;

  if (!supabaseAdmin) {
    console.error("[reports/:caseNumber] supabaseAdmin not configured");
    return noStore(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("reports")
    .select("*")
    .eq("case_number", caseNumber)
    .maybeSingle();

  if (error) {
    console.error("[reports/:caseNumber] lookup error:", error);
    return noStore({ ok: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return noStore({ ok: false, error: "Not found" }, { status: 404 });
  }

  const status = data.status || "pending";

  const base: Partial<Report> = {
    case_number: data.case_number,
    name: data.name,
    category: data.category,
    item_description: data.item_description,
    location: data.location,
    location_detail: data.location_detail,
    date_lost: data.date_lost,
    status,
    plan: data.plan === "all_in_one" ? "all_in_one" : "recovery",
    locale: data.locale === "ja" ? "ja" : "en",
  };

  if (status === "found" || status === "paid") {
    (base as any).found_images = Array.isArray(data.found_images)
      ? data.found_images
      : [];
  }

  const recovery =
    status === "paid"
      ? {
          recovery_location: data.recovery_location,
          recovery_contact: data.recovery_contact,
          recovery_hours: data.recovery_hours,
          recovery_instructions: data.recovery_instructions,
          authorization_url: data.authorization_url || null,
        }
      : {};

  return noStore({ ok: true, report: { ...base, ...recovery } });
}
