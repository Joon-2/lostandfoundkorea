-- Deliveries module schema. Splits shipping/handoff data out of reports
-- so admin can manage carrier flows, tracking numbers, recipient info,
-- and delivery state independently of search/recovery state.
--
-- A report can have zero or more deliveries (failed first attempt →
-- second shipment is a new row). FK ON DELETE CASCADE because deleting
-- a report should clean its delivery rows too.
--
-- Idempotent: every constraint and trigger guards on pg_constraint /
-- pg_trigger before creating. Safe to re-run.

BEGIN;

-- Reuse the trigger function from prior migrations if present;
-- otherwise create it. CREATE OR REPLACE is idempotent.
CREATE OR REPLACE FUNCTION set_updated_at_now()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  carrier text,
  tracking_number text,
  recipient_name text,
  recipient_phone text,
  recipient_address text,
  recipient_country text,
  shipping_fee numeric,
  shipping_fee_currency text DEFAULT 'USD',
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deliveries_status_check'
  ) THEN
    ALTER TABLE deliveries
      ADD CONSTRAINT deliveries_status_check
      CHECK (status IN (
        'pending',
        'shipped',
        'in_transit',
        'delivered',
        'failed',
        'returned'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS deliveries_report_id_idx
  ON deliveries(report_id);
CREATE INDEX IF NOT EXISTS deliveries_status_idx
  ON deliveries(status);
CREATE INDEX IF NOT EXISTS deliveries_created_at_idx
  ON deliveries(created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'deliveries_set_updated_at'
  ) THEN
    CREATE TRIGGER deliveries_set_updated_at
      BEFORE UPDATE ON deliveries
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_now();
  END IF;
END $$;

COMMIT;
