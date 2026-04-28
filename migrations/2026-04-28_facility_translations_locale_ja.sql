-- Updates the facility_translations.locale CHECK constraint to allow
-- 'ja' instead of 'ko'. Korean was a placeholder locale that was never
-- populated; the i18n migration of 2026-04-28 drops Korean entirely
-- and adds Japanese as the second supported locale.
--
-- Idempotent: safe to re-run. Drops the old constraint if present and
-- re-adds it with the new locale list. Any existing 'ko' rows (none
-- expected — Korean was never translated) are deleted before the
-- re-add so the new constraint can attach cleanly.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'facility_translations_locale_check'
  ) THEN
    ALTER TABLE facility_translations
      DROP CONSTRAINT facility_translations_locale_check;
  END IF;
END $$;

DELETE FROM facility_translations WHERE locale = 'ko';

ALTER TABLE facility_translations
  ADD CONSTRAINT facility_translations_locale_check
  CHECK (locale IN ('en', 'ja'));
