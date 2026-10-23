-- Enable RLS on all tables
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement ENABLE ROW LEVEL SECURITY;
ALTER TABLE grouptable ENABLE ROW LEVEL SECURITY;
ALTER TABLE timewindow ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilitators ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment ENABLE ROW LEVEL SECURITY;

-- student
CREATE POLICY "Authenticated users can select student" ON student FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert student" ON student FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update student" ON student FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete student" ON student FOR DELETE TO authenticated USING (true);

-- cohort
CREATE POLICY "Authenticated users can select cohort" ON cohort FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert cohort" ON cohort FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update cohort" ON cohort FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete cohort" ON cohort FOR DELETE TO authenticated USING (true);

-- plan
CREATE POLICY "Authenticated users can select plan" ON plan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert plan" ON plan FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update plan" ON plan FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete plan" ON plan FOR DELETE TO authenticated USING (true);

-- enrollment
CREATE POLICY "Authenticated users can select enrollment" ON enrollment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert enrollment" ON enrollment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update enrollment" ON enrollment FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete enrollment" ON enrollment FOR DELETE TO authenticated USING (true);

-- placement
CREATE POLICY "Authenticated users can select placement" ON placement FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert placement" ON placement FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update placement" ON placement FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete placement" ON placement FOR DELETE TO authenticated USING (true);

-- grouptable
CREATE POLICY "Authenticated users can select grouptable" ON grouptable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert grouptable" ON grouptable FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update grouptable" ON grouptable FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete grouptable" ON grouptable FOR DELETE TO authenticated USING (true);

-- timewindow
CREATE POLICY "Authenticated users can select timewindow" ON timewindow FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert timewindow" ON timewindow FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update timewindow" ON timewindow FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete timewindow" ON timewindow FOR DELETE TO authenticated USING (true);

-- facilitators
CREATE POLICY "Authenticated users can select facilitators" ON facilitators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert facilitators" ON facilitators FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update facilitators" ON facilitators FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete facilitators" ON facilitators FOR DELETE TO authenticated USING (true);

-- assignment
CREATE POLICY "Authenticated users can select assignment" ON assignment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert assignment" ON assignment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update assignment" ON assignment FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete assignment" ON assignment FOR DELETE TO authenticated USING (true);
