-- Rename severity values: error → high, warning → medium
-- This aligns the severity scale with a proper Low/Medium/High/Critical nomenclature.
-- "error" was ambiguous (sounded like a type, not a severity level).

UPDATE "ErrorLog" SET severity = 'high'   WHERE severity = 'error';
UPDATE "ErrorLog" SET severity = 'medium' WHERE severity = 'warning';
