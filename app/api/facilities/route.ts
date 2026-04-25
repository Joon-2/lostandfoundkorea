import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminAuth } from "@/lib/admin-auth";
import {
  sanitizeFacilityRowInput,
  sanitizeTranslationsMap,
} from "@/lib/facility-sanitize";
import {
  resolveFacility,
  indexTranslations,
} from "@/lib/facility-i18n";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type Locale,
} from "@/config/locales";
import type {
  Facility,
  FacilityRow,
  FacilityTranslation,
} from "@/types/facility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — list facilities resolved against a locale.
//   ?locale=en|ko (default en).
//   Admin password: returns every row, including inactive, plus the
//     full `translations` map so the form can render both tabs.
//   No password: only is_active=true rows (public /coverage feed).
export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    console.error("[facilities] supabaseAdmin not configured");
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const isAdmin = checkAdminAuth(request) === null;
  const url = new URL(request.url);
  const requested = url.searchParams.get("locale");
  const locale: Locale = isSupportedLocale(requested)
    ? requested
    : DEFAULT_LOCALE;

  let rowQuery = supabaseAdmin
    .from("facilities")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (!isAdmin) rowQuery = rowQuery.eq("is_active", true);

  const { data: rows, error: rowError } = await rowQuery;
  if (rowError) {
    console.error("[facilities] row select error:", rowError);
    return Response.json(
      { ok: false, error: rowError.message },
      { status: 500 }
    );
  }

  const ids = (rows || []).map((r) => r.id);
  let translations: FacilityTranslation[] = [];
  if (ids.length > 0) {
    const { data: tData, error: tError } = await supabaseAdmin
      .from("facility_translations")
      .select("*")
      .in("facility_id", ids);
    if (tError) {
      console.error("[facilities] translations select error:", tError);
      return Response.json(
        { ok: false, error: tError.message },
        { status: 500 }
      );
    }
    translations = (tData || []) as FacilityTranslation[];
  }

  const grouped = indexTranslations(translations);
  const resolved: Facility[] = (rows || []).map((row) =>
    resolveFacility(row as FacilityRow, grouped.get(row.id) || [], locale)
  );

  // Stable sort: sort_order first, then resolved name.
  resolved.sort((a, b) => {
    const so = (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity);
    if (so !== 0) return so;
    return (a.name || "").localeCompare(b.name || "");
  });

  return Response.json({ ok: true, facilities: resolved, locale });
}

// POST — create a facility plus one or more translation rows.
// Body shape:
//   { ...row fields..., translations: { en: { name, address?, description? }, ko?: {...} } }
// English translation is required; Korean is optional.
export async function POST(request: NextRequest) {
  const denied = checkAdminAuth(request);
  if (denied) return denied;

  if (!supabaseAdmin) {
    return Response.json(
      { ok: false, error: "Server not configured" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const rowFields = sanitizeFacilityRowInput(body);
  const translations = sanitizeTranslationsMap(body?.translations);

  if (!rowFields.category) {
    return Response.json(
      { ok: false, error: "category is required" },
      { status: 400 }
    );
  }
  if (!translations.en?.name) {
    return Response.json(
      { ok: false, error: "English name is required" },
      { status: 400 }
    );
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("facilities")
    .insert(rowFields)
    .select()
    .single();
  if (insertError || !inserted) {
    console.error("[facilities] insert error:", insertError);
    return Response.json(
      { ok: false, error: insertError?.message || "Insert failed" },
      { status: 500 }
    );
  }

  const translationRows = Object.entries(translations).map(
    ([locale, fields]) => ({
      facility_id: inserted.id,
      locale,
      name: fields!.name as string,
      address: fields!.address ?? null,
      description: fields!.description ?? null,
    })
  );

  if (translationRows.length > 0) {
    const { error: tError } = await supabaseAdmin
      .from("facility_translations")
      .insert(translationRows);
    if (tError) {
      // Roll back the row so we don't leave an orphan.
      await supabaseAdmin.from("facilities").delete().eq("id", inserted.id);
      console.error("[facilities] translation insert error:", tError);
      return Response.json(
        { ok: false, error: tError.message },
        { status: 500 }
      );
    }
  }

  // Re-fetch translations so the response matches the GET shape.
  const { data: fresh } = await supabaseAdmin
    .from("facility_translations")
    .select("*")
    .eq("facility_id", inserted.id);

  const facility = resolveFacility(
    inserted as FacilityRow,
    (fresh || []) as FacilityTranslation[],
    DEFAULT_LOCALE
  );

  return Response.json({ ok: true, facility });
}
