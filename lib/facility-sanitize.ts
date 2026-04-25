import type { FacilityRow, FacilityTranslationFields } from "@/types/facility";
import { isSupportedLocale, type Locale } from "@/config/locales";

// Whitelisted columns on the main `facilities` row. After the
// 2026-04-26 migration, no translatable text fields are here.
const ROW_STRING_FIELDS = [
  "category",
  "phone",
  "phone_2",
  "email",
  "hours",
  "hours_note",
  "website",
  "location_detail",
  "how_to_report",
  "how_to_trace",
  "retention_period",
] as const;

const TRANSLATION_FIELDS = ["name", "address", "description"] as const;

// Strip and coerce input destined for the facilities row: trim strings,
// "" → null, parse tags from comma-separated string, coerce sort_order
// and is_active.
export function sanitizeFacilityRowInput(
  input: Partial<FacilityRow> & { tags?: any; sort_order?: any; is_active?: any }
): Record<string, any> {
  const out: Record<string, any> = {};
  for (const f of ROW_STRING_FIELDS) {
    if (f in input) {
      const v = (input as any)[f];
      out[f] = typeof v === "string" ? v.trim() || null : v ?? null;
    }
  }
  if ("tags" in input) {
    const t = (input as any).tags;
    if (Array.isArray(t)) {
      out.tags = t.map((s: any) => String(s).trim()).filter(Boolean);
    } else if (typeof t === "string") {
      out.tags = t
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else {
      out.tags = null;
    }
  }
  if ("sort_order" in input) {
    const n = Number((input as any).sort_order);
    out.sort_order = Number.isFinite(n) ? n : null;
  }
  if ("is_active" in input) {
    out.is_active = Boolean((input as any).is_active);
  }
  return out;
}

// Pull a single locale's translation fields out of the input. Returns
// null if the locale block is empty (so admin can save EN-only without
// creating a stub KO row).
export function sanitizeTranslationInput(
  input: Partial<FacilityTranslationFields> | undefined | null
): Partial<FacilityTranslationFields> | null {
  if (!input || typeof input !== "object") return null;
  const out: Partial<FacilityTranslationFields> = {};
  for (const f of TRANSLATION_FIELDS) {
    const v = (input as any)[f];
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed) (out as any)[f] = trimmed;
      else if (f !== "name") (out as any)[f] = null;
    }
  }
  // Empty block (no name, no address, no description) → drop entirely.
  if (!out.name && out.address == null && out.description == null) return null;
  return out;
}

// Pluck the `translations` map from request body, validate locales.
export function sanitizeTranslationsMap(
  input: any
): Partial<Record<Locale, Partial<FacilityTranslationFields>>> {
  if (!input || typeof input !== "object") return {};
  const out: Partial<Record<Locale, Partial<FacilityTranslationFields>>> = {};
  for (const key of Object.keys(input)) {
    if (!isSupportedLocale(key)) continue;
    const cleaned = sanitizeTranslationInput(input[key]);
    if (cleaned) out[key] = cleaned;
  }
  return out;
}
