import type {
  Facility,
  FacilityRow,
  FacilityTranslation,
  FacilityTranslationFields,
} from "@/types/facility";
import { DEFAULT_LOCALE, type Locale } from "@/config/locales";

// Merge a row with its translations for the requested locale. Falls back
// to English if the requested locale has no translation. If even English
// is missing, returns a minimal placeholder so callers don't crash; this
// only happens for orphaned rows since admin enforces EN required.
export function resolveFacility(
  row: FacilityRow,
  translations: FacilityTranslation[],
  preferredLocale: Locale
): Facility {
  const byLocale = new Map<Locale, FacilityTranslation>();
  for (const t of translations) {
    if (t && t.locale) byLocale.set(t.locale as Locale, t);
  }

  const t =
    byLocale.get(preferredLocale) ??
    byLocale.get(DEFAULT_LOCALE) ??
    null;

  const fields: FacilityTranslationFields = t
    ? { name: t.name, address: t.address, description: t.description }
    : { name: "(unnamed)", address: null, description: null };

  const all: Partial<Record<Locale, FacilityTranslationFields>> = {};
  for (const [loc, val] of byLocale.entries()) {
    all[loc] = {
      name: val.name,
      address: val.address,
      description: val.description,
    };
  }

  return {
    ...row,
    ...fields,
    resolved_locale: t ? (t.locale as Locale) : preferredLocale,
    translations: all,
  };
}

// Group translation rows by facility_id so resolveFacility can walk a
// list of rows + a flat translations array efficiently.
export function indexTranslations(
  translations: FacilityTranslation[]
): Map<string, FacilityTranslation[]> {
  const out = new Map<string, FacilityTranslation[]>();
  for (const t of translations) {
    const list = out.get(t.facility_id) ?? [];
    list.push(t);
    out.set(t.facility_id, list);
  }
  return out;
}
