ALTER TABLE placement DROP COLUMN IF EXISTS plan_id;
ALTER TABLE placement ADD COLUMN plan_id UUID REFERENCES plan(id);

ALTER TABLE placement DROP COLUMN IF EXISTS student_id;
ALTER TABLE placement ADD COLUMN student_id UUID REFERENCES student(id);

ALTER TABLE placement ADD PRIMARY KEY (plan_id, student_id);

ALTER TABLE placement DROP CONSTRAINT IF EXISTS placement_plan_id_fkey;
ALTER TABLE placement
ADD CONSTRAINT placement_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES plan(id) ON DELETE CASCADE;

ALTER TABLE placement DROP CONSTRAINT IF EXISTS placement_student_id_fkey;
ALTER TABLE placement
ADD CONSTRAINT placement_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE;
