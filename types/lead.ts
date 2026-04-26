// Lead = a B2B outreach contact (insurance companies first; airlines /
// hotels / others later via PARTNER_TYPES expansion).

export type LeadStatus = "lead" | "contacted" | "negotiating" | "closed";

export const LEAD_STATUSES: LeadStatus[] = [
  "lead",
  "contacted",
  "negotiating",
  "closed",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  lead: "Lead",
  contacted: "Contacted",
  negotiating: "Negotiating",
  closed: "Closed",
};

export const LEAD_STATUS_BADGE: Record<LeadStatus, string> = {
  lead: "bg-slate-100 text-slate-700 border-slate-200",
  contacted: "bg-sky-50 text-sky-700 border-sky-200",
  negotiating: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-emerald-50 text-accent border-emerald-200",
};

// Partner types — extensible. Add a new value to PARTNER_TYPES and a
// label below; the picker UI reads from the array. The DB column is
// plain text, no CHECK constraint, so adding a value is zero-migration.
export const PARTNER_TYPES = ["insurance"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

export const PARTNER_TYPE_LABELS: Record<string, string> = {
  insurance: "Insurance",
  // airline: "Airline",
  // hotel: "Hotel",
};

export interface Lead {
  id: string;
  lead_number: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  status: LeadStatus;
  partner_type: PartnerType | string;
  created_at: string;
  updated_at: string;
}
