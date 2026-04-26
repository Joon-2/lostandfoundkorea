import { LEAD_STATUSES, type LeadStatus } from "@/types/lead";

const STRING_FIELDS = [
  "company_name",
  "contact_person",
  "email",
  "partner_type",
] as const;

// Whitelist + coerce input destined for the leads table.
export function sanitizeLeadInput(input: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const f of STRING_FIELDS) {
    if (f in input) {
      const v = (input as any)[f];
      out[f] = typeof v === "string" ? v.trim() || null : v ?? null;
    }
  }
  if ("status" in input) {
    const s = String((input as any).status);
    if (LEAD_STATUSES.includes(s as LeadStatus)) {
      out.status = s;
    }
  }
  return out;
}

// LEAD-XXXXXX format, mirroring the LFK case-number convention.
// Rare collisions on the UNIQUE constraint will surface as an INSERT
// error to the caller; admin retries.
export function generateLeadNumber(): string {
  const n = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `LEAD-${n}`;
}
