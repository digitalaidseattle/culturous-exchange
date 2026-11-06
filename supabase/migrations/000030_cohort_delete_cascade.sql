-- CEMT-85: Deleting a cohort failed when one of its plans had groups.
-- plan.cohort_id already cascades from cohort (see 000009_db_cohort_delete.sql)
-- and placement.plan_id from plan (000011), but grouptable.plan_id and
-- timewindow.group_id were NO ACTION, so Postgres rejected the delete.
-- Cascade plan -> grouptable and grouptable -> timewindow.
-- placement.group_id is deliberately left NO ACTION: planGenerator.emptyPlan
-- deletes groups while the plan survives, and a cascade there would delete placements.

ALTER TABLE
    grouptable DROP CONSTRAINT grouptable_plan_id_fkey;

ALTER TABLE
    grouptable
ADD
    CONSTRAINT grouptable_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES plan(id) ON DELETE CASCADE;

ALTER TABLE
    timewindow DROP CONSTRAINT timewindow_group_id_fkey;

ALTER TABLE
    timewindow
ADD
    CONSTRAINT timewindow_group_id_fkey FOREIGN KEY (group_id) REFERENCES grouptable(id) ON DELETE CASCADE;
