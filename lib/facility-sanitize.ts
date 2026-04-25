import type { FacilityInsert } from "@/types/facility";

const STRING_FIELDS = [
  "category",
  "name_en",
  "name_ko",
  "phone",
  "phone_2",
  "email",
  "hours",
  "hours_note",
  "address_en",
  "address_ko",
  "website",
  "location_detail",
  "notes",
  "how_to_report",
  "how_to_trace",
  "retention_period",
] as const;

// Whitelist + normalize input from the admin form. Trims strings, coerces
// "" → null so the DB stores NULL instead of empty string, parses tags
// (array passthrough or comma-separated string), and coerces sort_order /
// active. Used by both POST /api/facilities and PUT /api/facilities/[id].
export function sanitizeFacilityInput(input: Partial<FacilityInsert>) {
  const out: Record<string, any> = {};
  for (const f of STRING_FIELDS) {
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
  if ("active" in input) {
    out.active = Boolean((input as any).active);
  }
  return out;
}
