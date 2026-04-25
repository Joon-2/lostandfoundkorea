import type { Locale } from "@/config/locales";

export type FacilityCategory =
  | "airports"
  | "subway"
  | "trains"
  | "buses"
  | "taxis"
  | "hotels"
  | "shopping"
  | "attractions"
  | "police"
  | "restaurants";

// Translatable fields. Lives on facility_translations rows.
export interface FacilityTranslationFields {
  name: string;
  address: string | null;
  description: string | null;
}

export interface FacilityTranslation extends FacilityTranslationFields {
  id: string;
  facility_id: string;
  locale: Locale;
  created_at: string;
  updated_at: string;
}

// The raw `facilities` row — non-translatable fields only after the
// 2026-04-26 migration.
export interface FacilityRow {
  id: string;
  category: FacilityCategory;
  phone: string | null;
  phone_2: string | null;
  email: string | null;
  hours: string | null;
  hours_note: string | null;
  website: string | null;
  location_detail: string | null;
  how_to_report: string | null;
  how_to_trace: string | null;
  retention_period: string | null;
  tags: string[] | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// A facility resolved against a single locale: the row + the
// translation for that locale (with English fallback handled by the
// resolver). Public pages and the admin list both read this shape.
export interface Facility extends FacilityRow, FacilityTranslationFields {
  // Which locale the merged translation actually came from. Useful in
  // admin UI to flag rows missing a Korean translation.
  resolved_locale: Locale;
  // True when admin is loading the row to edit; carries every
  // available translation so the form can show both EN and KO tabs.
  translations?: Partial<Record<Locale, FacilityTranslationFields>>;
}

// API insert/update payload shape. Caller sends top-level non-
// translatable fields plus a `translations` map keyed by locale.
export interface FacilityWritePayload
  extends Partial<Omit<FacilityRow, "id" | "created_at" | "updated_at">> {
  translations: Partial<Record<Locale, Partial<FacilityTranslationFields>>>;
}
