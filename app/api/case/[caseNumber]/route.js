import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { caseNumber } = await params;

  if (!supabaseAdmin) {
    console.error("case lookup: supabaseAdmin not configured");
    return Response.json(
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
    console.error("case lookup error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const status = data.status || "pending";

  const base = {
    case_number: data.case_number,
    name: data.name,
    category: data.category,
    item_description: data.item_description,
    location: data.location,
    location_detail: data.location_detail,
    date_lost: data.date_lost,
    status,
  };

  const recovery =
    status === "paid"
      ? {
          recovery_location: data.recovery_location,
          recovery_contact: data.recovery_contact,
          recovery_hours: data.recovery_hours,
          recovery_instructions: data.recovery_instructions,
          photos: Array.isArray(data.photos) ? data.photos : [],
        }
      : {};

  return Response.json({ ok: true, report: { ...base, ...recovery } });
}
