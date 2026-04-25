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

export interface Facility {
  id: string;
  category: FacilityCategory;
  name_en: string;
  name_ko: string | null;
  phone: string | null;
  phone_2: string | null;
  email: string | null;
  hours: string | null;
  hours_note: string | null;
  address_en: string | null;
  address_ko: string | null;
  website: string | null;
  location_detail: string | null;
  notes: string | null;
  how_to_report: string | null;
  how_to_trace: string | null;
  retention_period: string | null;
  tags: string[] | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
}

export type FacilityInsert = Omit<Facility, "id" | "created_at">;
export type FacilityUpdate = Partial<FacilityInsert>;
