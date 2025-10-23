-- =========================================
-- Test Data Seeder for Cohort/Plan/Enrollment/Groups/Placements
-- Requires: student, timewindow data
-- =========================================
BEGIN;

-- 1) UUID generator (pgcrypto is widely available on managed Postgres)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------
-- 2) Seed cohorts (idempotent by name)
-- -----------------------------------------
WITH wanted(name) AS (
  VALUES ('Fall 2025'), ('Spring 2026')
)
INSERT INTO public.cohort (name, id)
SELECT w.name, gen_random_uuid()
FROM wanted w
WHERE NOT EXISTS (
  SELECT 1 FROM public.cohort c WHERE c.name = w.name
);

-- Helper: get cohort ids we care about
WITH c AS (
  SELECT id, name FROM public.cohort WHERE name IN ('Fall 2025','Spring 2026')
)
SELECT * FROM c;  -- optional peek (no-op effect)

-- -----------------------------------------
-- 3) Seed one plan per cohort (idempotent per cohort)
-- -----------------------------------------
INSERT INTO public.plan (name, note, cohort_id, id)
SELECT
  'Global Plan - ' || c.name AS name,
  'Seeded test data for ' || c.name     AS note,
  c.id                                   AS cohort_id,
  gen_random_uuid()                      AS id
FROM public.cohort c
WHERE c.name IN ('Fall 2025','Spring 2026')
  AND NOT EXISTS (
    SELECT 1 FROM public.plan p WHERE p.cohort_id = c.id
  );

-- -----------------------------------------
-- 4) Enroll every student into a cohort by rule:
--    tz_offset > 0  -> Spring 2026
--    else           -> Fall 2025
-- -----------------------------------------
INSERT INTO public.enrollment (cohort_id, student_id)
SELECT choice.cohort_id, s.id
FROM public.student s
JOIN LATERAL (
  SELECT c.id AS cohort_id
  FROM public.cohort c
  WHERE c.name = CASE WHEN s.tz_offset > 0 THEN 'Spring 2026' ELSE 'Fall 2025' END
  LIMIT 1
) AS choice ON TRUE
LEFT JOIN public.enrollment e
  ON e.student_id = s.id AND e.cohort_id = choice.cohort_id
WHERE e.student_id IS NULL;

-- -----------------------------------------
-- 5) Create 4 regional groups per plan (idempotent per (plan_id,name))
--    Buckets: Americas, Europe/Africa, Middle East/India, APAC
-- -----------------------------------------
WITH plan_list AS (
  SELECT p.id AS plan_id
  FROM public.plan p
  JOIN public.cohort c ON c.id = p.cohort_id
  WHERE c.name IN ('Fall 2025','Spring 2026')
),
group_names AS (
  SELECT * FROM (VALUES
    ('Americas'),
    ('Europe/Africa'),
    ('Middle East/India'),
    ('APAC')
  ) AS g(name)
)
INSERT INTO public.grouptable (country_count, id, plan_id, name)
SELECT
  0::int                        AS country_count,
  gen_random_uuid()             AS id,
  pl.plan_id                    AS plan_id,
  gn.name                       AS name
FROM plan_list pl
CROSS JOIN group_names gn
WHERE NOT EXISTS (
  SELECT 1 FROM public.grouptable gt
  WHERE gt.plan_id = pl.plan_id AND gt.name = gn.name
);

-- -----------------------------------------
-- 6) Place each enrolled student into a group for their cohort's plan
--    Mapping by tz_offset:
--      <= -2  -> Americas
--      (-2, 2] -> Europe/Africa
--      (2, 6] -> Middle East/India
--      > 6     -> APAC
-- -----------------------------------------
INSERT INTO public.placement (anchor, priority, plan_id, student_id, group_id)
SELECT
  s.anchor                                         AS anchor,
  CASE WHEN s.anchor THEN 1 ELSE 2 END             AS priority,
  p.id                                             AS plan_id,
  s.id                                             AS student_id,
  g.id                                             AS group_id
FROM public.enrollment e
JOIN public.student   s ON s.id = e.student_id
JOIN public.plan      p ON p.cohort_id = e.cohort_id
JOIN LATERAL (
  SELECT gt.id
  FROM public.grouptable gt
  WHERE gt.plan_id = p.id
    AND gt.name = CASE
      WHEN s.tz_offset <= -2 THEN 'Americas'
      WHEN s.tz_offset <=  2 THEN 'Europe/Africa'
      WHEN s.tz_offset <=  6 THEN 'Middle East/India'
      ELSE                         'APAC'
    END
  LIMIT 1
) AS g ON TRUE
LEFT JOIN public.placement pl
  ON pl.student_id = s.id AND pl.plan_id = p.id
WHERE pl.student_id IS NULL
ON CONFLICT (student_id, plan_id) DO NOTHING;

-- -----------------------------------------
-- 7) Compute country_count for each group (distinct student countries)
-- -----------------------------------------
UPDATE public.grouptable gt
SET country_count = sub.country_cnt
FROM (
  SELECT gt2.id, COUNT(DISTINCT s.country) AS country_cnt
  FROM public.grouptable gt2
  JOIN public.placement  pl ON pl.group_id = gt2.id
  JOIN public.student     s ON s.id = pl.student_id
  GROUP BY gt2.id
) AS sub
WHERE gt.id = sub.id;

COMMIT;

-- -----------------------------------------
-- 8) Quick sanity checks (optional)
-- -----------------------------------------
-- Cohorts & plans
SELECT c.name AS cohort, p.id AS plan_id, p.name AS plan_name
FROM public.plan p JOIN public.cohort c ON c.id = p.cohort_id
ORDER BY cohort;

-- Enrollments
SELECT c.name AS cohort, COUNT(*) AS students
FROM public.enrollment e JOIN public.cohort c ON c.id = e.cohort_id
GROUP BY c.name ORDER BY c.name;

-- Groups per plan
SELECT p.name AS plan, gt.name AS group_name, gt.country_count
FROM public.grouptable gt JOIN public.plan p ON p.id = gt.plan_id
ORDER BY p.name, gt.name;

-- Placements
SELECT p.name AS plan, gt.name AS group_name, COUNT(*) AS students
FROM public.placement pl
JOIN public.plan p       ON p.id = pl.plan_id
JOIN public.grouptable gt ON gt.id = pl.group_id
GROUP BY p.name, gt.name
ORDER BY p.name, gt.name;
