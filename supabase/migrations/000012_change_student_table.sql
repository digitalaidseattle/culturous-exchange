ALTER TABLE student DROP COLUMN IF EXISTS city;
-- state is reserved so using double quotes
ALTER TABLE student DROP COLUMN IF EXISTS "state";
ALTER TABLE student ADD COLUMN IF NOT EXISTS gender TEXT;