-- Adds the `locale` column to the reports table so each case remembers
-- which language the customer used. Used for routing the payment page,
-- selecting the right email template, and surfacing a Lang badge in
-- the admin case list.
--
-- Idempotent: safe to re-run.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'reports' AND column_name = 'locale'
  ) THEN
    ALTER TABLE reports
      ADD COLUMN locale text NOT NULL DEFAULT 'en';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reports_locale_check'
  ) THEN
    ALTER TABLE reports
      ADD CONSTRAINT reports_locale_check
      CHECK (locale IN ('en', 'ja'));
  END IF;
END $$;
