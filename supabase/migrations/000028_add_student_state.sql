-- CEMT-137: Add a state column to student.
-- Nullable on purpose: state is only mandatory for US students,
-- and that rule is enforced by app-side validation (StateValidator),
-- not by the database.
ALTER TABLE student ADD COLUMN state TEXT;
