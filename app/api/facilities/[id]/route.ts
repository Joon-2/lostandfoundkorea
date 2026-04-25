import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import {
  sanitizeFacilityRowInput,
  sanitizeTranslationsMap,
} from "@/lib/facility-sanitize";
import { resolveFacility } from "@/lib/facility-i18n";
import { DEFAULT_LOCALE } from "@/config/locales";
import type { FacilityRow, FacilityTranslation } from "@/types/facility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT — update row + upsert per-locale translation rows.
// Translation rules:
//   - If `translations.en` is supplied with a name, upsert it.
//   - If `translations.ko` is supplied with a name, upsert it.
//   - If a locale block is omitted, leave existing translation alone.
//   - Send an empty/cleared name in a locale block to remove that
//     translation (we currently don't expose "delete a translation"
//     in the form, but the API supports omitting it).
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
  const rowFields = sanitizeFacilityRowInput(body);
  const translations = sanitizeTranslationsMap(body?.translations);

  // Update the row when there's at least one whitelisted field.
  if (Object.keys(rowFields).length > 0) {
    const { error: rowError } = await supabaseAdmin
      .from("facilities")
      .update(rowFields)
      .eq("id", id);
    if (rowError) {
      console.error("[facilities/:id] row update error:", rowError);
      return Response.json(
        { ok: false, error: rowError.message },
        { status: 500 }
      );
    }
  }

  // Upsert translations. UNIQUE(facility_id, locale) makes this safe.
  const upserts = Object.entries(translations).map(([locale, fields]) => ({
    facility_id: id,
    locale,
    name: fields!.name as string,
    address: fields!.address ?? null,
    description: fields!.description ?? null,
  }));
  if (upserts.length > 0) {
    const { error: tError } = await supabaseAdmin
      .from("facility_translations")
      .upsert(upserts, { onConflict: "facility_id,locale" });
    if (tError) {
      console.error("[facilities/:id] translation upsert error:", tError);
      return Response.json(
        { ok: false, error: tError.message },
        { status: 500 }
      );
    }
  }

  // Return the freshly resolved facility.
  const [{ data: row }, { data: trs }] = await Promise.all([
    supabaseAdmin.from("facilities").select("*").eq("id", id).single(),
    supabaseAdmin.from("facility_translations").select("*").eq("facility_id", id),
  ]);
  if (!row) {
    return Response.json(
      { ok: false, error: "Facility not found after update" },
      { status: 404 }
    );
  }
  const facility = resolveFacility(
    row as FacilityRow,
    (trs || []) as FacilityTranslation[],
    DEFAULT_LOCALE
  );
  return Response.json({ ok: true, facility });
}

// DELETE — remove the row. ON DELETE CASCADE on
// facility_translations.facility_id removes its translations.
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
    .from("facilities")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[facilities/:id] delete error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}
