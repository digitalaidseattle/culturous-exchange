-- Create assignments table linking a facilitator to a group (one facilitator per group)

BEGIN;

CREATE TABLE IF NOT EXISTS assignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  facilitator_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure only one assignment exists per group
CREATE UNIQUE INDEX IF NOT EXISTS idx_assignment_group_id ON assignment (group_id);

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'assignment' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'group_id'
  ) THEN
    ALTER TABLE assignment
      ADD CONSTRAINT fk_assignment_group
      FOREIGN KEY (group_id) REFERENCES grouptable (id)
      ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'assignment' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'facilitator_id'
  ) THEN
    ALTER TABLE assignment
      ADD CONSTRAINT fk_assignment_facilitator
      FOREIGN KEY (facilitator_id) REFERENCES facilitators (id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- 3) Add assignment_id to timewindow if it doesn't already exist and link to assignment
ALTER TABLE timewindow
  ADD COLUMN IF NOT EXISTS assignment_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'timewindow' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'assignment_id'
  ) THEN
    ALTER TABLE timewindow
      ADD CONSTRAINT fk_timewindow_assignment
      FOREIGN KEY (assignment_id) REFERENCES assignment (id)
      ON DELETE SET NULL;
  END IF;
END$$;

COMMIT;
