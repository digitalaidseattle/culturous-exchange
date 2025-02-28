ALTER TABLE placement DROP COLUMN plan_id;
ALTER TABLE placement ADD COLUMN plan_id UUID REFERENCES plan(id);

ALTER TABLE placement DROP COLUMN student_id;
ALTER TABLE placement ADD COLUMN student_id UUID REFERENCES student(id);

ALTER TABLE placement ADD PRIMARY KEY (pland_id, student_id);

ALTER TABLE placement
ADD CONSTRAINT placement_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES plan(id) ON DELETE CASCADE;

-- ALTER TABLE placement
-- ADD CONSTRAINT placement_student_id_fkey FOREIGN KEY (student_id) REFERENCES student(id);

