-- Adds the facility_translations table and migrates any existing
-- translatable data from columns on `facilities` into translation rows.
-- Then drops those translatable columns from the main table.
--
-- Idempotent: every block guards on information_schema / pg_constraint
-- so re-running after the columns are dropped is a no-op. Safe to apply
-- in the Supabase SQL editor.
--
-- After this runs:
--   facilities — non-translatable fields only (id, category, phone,
--                phone_2, email, website, hours, hours_note,
--                location_detail, how_to_report, how_to_trace,
--                retention_period, tags, sort_order, is_active,
--                created_at, updated_at)
--   facility_translations — one row per (facility_id, locale) with
--                name (required), address, description.

BEGIN;

-- ─── 1. Translation table ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS facility_translations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  locale text NOT NULL,
  name text NOT NULL,
  address text,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Locale check. Extending later: alter the IN list, or move locales to
-- a lookup table.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'facility_translations_locale_check'
  ) THEN
    ALTER TABLE facility_translations
      ADD CONSTRAINT facility_translations_locale_check
      CHECK (locale IN ('en', 'ko'));
  END IF;
END $$;

-- One translation per (facility, locale).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'facility_translations_unique'
  ) THEN
    ALTER TABLE facility_translations
      ADD CONSTRAINT facility_translations_unique
      UNIQUE (facility_id, locale);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS facility_translations_facility_id_idx
  ON facility_translations(facility_id);

-- ─── 2. Backfill from old translatable columns ───────────────────────

-- name (single column, treat as English)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'name'
  ) THEN
    INSERT INTO facility_translations (facility_id, locale, name)
    SELECT id, 'en', name FROM facilities
     WHERE name IS NOT NULL AND name <> ''
    ON CONFLICT (facility_id, locale) DO UPDATE
      SET name = EXCLUDED.name, updated_at = now();
  END IF;
END $$;

-- name_en (treat as English)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'name_en'
  ) THEN
    INSERT INTO facility_translations (facility_id, locale, name)
    SELECT id, 'en', name_en FROM facilities
     WHERE name_en IS NOT NULL AND name_en <> ''
    ON CONFLICT (facility_id, locale) DO UPDATE
      SET name = EXCLUDED.name, updated_at = now();
  END IF;
END $$;

-- name_ko (Korean). Skip rows with empty Korean name to honor the
-- "EN required, KO optional" rule.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'name_ko'
  ) THEN
    -- Korean translations need a non-null name (NOT NULL constraint).
    -- Use a placeholder if the only Korean column with content is
    -- something other than name.
    INSERT INTO facility_translations (facility_id, locale, name)
    SELECT id, 'ko', name_ko FROM facilities
     WHERE name_ko IS NOT NULL AND name_ko <> ''
    ON CONFLICT (facility_id, locale) DO UPDATE
      SET name = EXCLUDED.name, updated_at = now();
  END IF;
END $$;

-- address (single column → English)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'address'
  ) THEN
    UPDATE facility_translations t
       SET address = f.address, updated_at = now()
      FROM facilities f
     WHERE t.facility_id = f.id
       AND t.locale = 'en'
       AND f.address IS NOT NULL AND f.address <> ''
       AND (t.address IS NULL OR t.address = '');
  END IF;
END $$;

-- address_en
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'address_en'
  ) THEN
    UPDATE facility_translations t
       SET address = f.address_en, updated_at = now()
      FROM facilities f
     WHERE t.facility_id = f.id
       AND t.locale = 'en'
       AND f.address_en IS NOT NULL AND f.address_en <> '';
  END IF;
END $$;

-- address_ko (only if there's a Korean translation row to merge into)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'address_ko'
  ) THEN
    UPDATE facility_translations t
       SET address = f.address_ko, updated_at = now()
      FROM facilities f
     WHERE t.facility_id = f.id
       AND t.locale = 'ko'
       AND f.address_ko IS NOT NULL AND f.address_ko <> '';
  END IF;
END $$;

-- notes / description → description on the EN row
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'notes'
  ) THEN
    UPDATE facility_translations t
       SET description = f.notes, updated_at = now()
      FROM facilities f
     WHERE t.facility_id = f.id
       AND t.locale = 'en'
       AND f.notes IS NOT NULL AND f.notes <> '';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name = 'facilities' AND column_name = 'description'
  ) THEN
    UPDATE facility_translations t
       SET description = f.description, updated_at = now()
      FROM facilities f
     WHERE t.facility_id = f.id
       AND t.locale = 'en'
       AND f.description IS NOT NULL AND f.description <> '';
  END IF;
END $$;

-- ─── 3. Drop translatable columns from the main table ────────────────

ALTER TABLE facilities DROP COLUMN IF EXISTS name;
ALTER TABLE facilities DROP COLUMN IF EXISTS name_en;
ALTER TABLE facilities DROP COLUMN IF EXISTS name_ko;
ALTER TABLE facilities DROP COLUMN IF EXISTS address;
ALTER TABLE facilities DROP COLUMN IF EXISTS address_en;
ALTER TABLE facilities DROP COLUMN IF EXISTS address_ko;
ALTER TABLE facilities DROP COLUMN IF EXISTS notes;
ALTER TABLE facilities DROP COLUMN IF EXISTS description;

-- ─── 4. updated_at trigger for facility_translations ─────────────────

CREATE OR REPLACE FUNCTION set_updated_at_now()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'facility_translations_set_updated_at'
  ) THEN
    CREATE TRIGGER facility_translations_set_updated_at
      BEFORE UPDATE ON facility_translations
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_now();
  END IF;
END $$;

COMMIT;
