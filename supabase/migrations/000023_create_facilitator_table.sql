BEGIN;

-- 1) Create facilitators table
CREATE TABLE IF NOT EXISTS facilitators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  time_zone text,
  tz_offset integer DEFAULT 0,
  bio text,
  avatar_url text,
  active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- unique index on email (optional if desired)
CREATE UNIQUE INDEX IF NOT EXISTS idx_facilitators_email ON facilitators (lower(email));

-- 2) Add facilitator_id to timewindow if it doesn't already exist
ALTER TABLE timewindow
  ADD COLUMN IF NOT EXISTS facilitator_id uuid;

-- Add foreign key constraint linking timewindow.facilitator_id -> facilitators.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'timewindow' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'facilitator_id'
  ) THEN
    ALTER TABLE timewindow
      ADD CONSTRAINT fk_timewindow_facilitator
      FOREIGN KEY (facilitator_id) REFERENCES facilitators (id)
      ON DELETE SET NULL;
  END IF;
END$$;

COMMIT;
