-- Sales / Leads schema. Tracks B2B outreach (insurance companies first;
-- partner_type is text-typed so adding "airline", "hotel", etc. later
-- needs zero schema work).
--
-- Idempotent: every constraint and trigger guards on pg_constraint /
-- pg_trigger before creating. Safe to re-run.

BEGIN;

-- Reuse the trigger function from prior migrations if present.
CREATE OR REPLACE FUNCTION set_updated_at_now()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_number text NOT NULL UNIQUE,
  company_name text NOT NULL,
  contact_person text,
  email text,
  status text NOT NULL DEFAULT 'lead',
  partner_type text NOT NULL DEFAULT 'insurance',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_status_check'
  ) THEN
    ALTER TABLE leads
      ADD CONSTRAINT leads_status_check
      CHECK (status IN ('lead', 'contacted', 'negotiating', 'closed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_partner_type_idx ON leads(partner_type);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'leads_set_updated_at'
  ) THEN
    CREATE TRIGGER leads_set_updated_at
      BEFORE UPDATE ON leads
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_now();
  END IF;
END $$;

COMMIT;
