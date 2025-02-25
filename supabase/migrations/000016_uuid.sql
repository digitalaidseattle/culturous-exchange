ALTER TABLE student DROP COLUMN id CASCADE;
ALTER TABLE student ADD COLUMN id UUID PRIMARY KEY;
ALTER TABLE enrollment DROP COLUMN student_id CASCADE;
ALTER TABLE enrollment ADD COLUMN student_id UUID REFERENCES student(id);
-- ALTER TABLE placement DROP COLUMN student_id CASCADE;
-- ALTER TABLE placement ADD COLUMN student_id UUID REFERENCES student(id);
-- ALTER TABLE placement ADD PRIMARY KEY (plan_id, student_id);
ALTER TABLE grouptable DROP COLUMN id CASCADE;
ALTER TABLE grouptable ADD COLUMN id UUID PRIMARY KEY;
ALTER TABLE grouptable DROP COLUMN plan_id CASCADE;
ALTER TABLE grouptable ADD COLUMN plan_id UUID REFERENCES plan(id);
ALTER TABLE selection DROP COLUMN group_id CASCADE;
ALTER TABLE selection ADD COLUMN group_id UUID REFERENCES grouptable(id);
ALTER TABLE selection DROP COLUMN student_id CASCADE;
ALTER TABLE selection ADD COLUMN student_id UUID REFERENCES student(id);
ALTER TABLE timewindow DROP COLUMN id CASCADE;
ALTER TABLE timewindow ADD COLUMN id UUID PRIMARY KEY;
ALTER TABLE timewindow DROP COLUMN group_id CASCADE;
ALTER TABLE timewindow ADD COLUMN group_id UUID REFERENCES grouptable(id);
ALTER TABLE timewindow DROP COLUMN student_id CASCADE;
ALTER TABLE timewindow ADD COLUMN student_id UUID REFERENCES student(id);


ALTER TABLE student DROP COLUMN availabilities CASCADE;