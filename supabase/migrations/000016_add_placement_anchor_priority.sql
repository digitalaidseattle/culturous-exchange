-- Add anchor and priority columns to placement table
ALTER TABLE placement ADD COLUMN IF NOT EXISTS anchor BOOLEAN DEFAULT FALSE;
ALTER TABLE placement ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
