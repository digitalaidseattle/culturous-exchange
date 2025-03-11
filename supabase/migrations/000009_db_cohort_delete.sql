ALTER TABLE
    enrollment DROP CONSTRAINT enrollment_cohort_id_fkey;

ALTER TABLE
    enrollment
ADD
    CONSTRAINT enrollment_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES cohort(id) ON DELETE CASCADE;

ALTER TABLE
    plan DROP CONSTRAINT plan_cohort_id_fkey;

ALTER TABLE
    plan
ADD
    CONSTRAINT plan_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES cohort(id) ON DELETE CASCADE;