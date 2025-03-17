/**
 * types.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
type Identifier = string | number | undefined;

type Entity = {
    id: Identifier;
}

type TimeWindow = Entity & {
    student_id: Identifier | null;
    group_id: Identifier | null;
    day_in_week: string;
    start_t: string;
    end_t: string;
}

type Student = Entity & {
    name: string;
    age: number | null;
    email: string;
    country: string;
    gender: string;
    time_zone: string;
}

type FailedStudent = Student & {
    failedError: string;
}

type StudentField = {
    key: keyof Student;
    label: string;
    type: string;
    required: boolean;
}

type Cohort = Entity & {
    name: string;
    plans: Plan[];
    enrolled: Student[];
}

type Group =  Entity & {
    plan_id: Identifier;
    groupNo?: string;
    country_count: number;
    students: Student[];
}

type Enrollment = Entity & {
    cohort_id: Identifier;
    student_id: Identifier;
}

type Placement = Entity &  {
    plan_id: Identifier;
    student_id: Identifier;
    student?: Student;
    anchor: boolean;
    priority: boolean;
    time_windows?: TimeWindow[];
}

type Plan = Entity & {
    name: string;
    cohort_id: Identifier;
    placements: Placement[]
    groups: Group[];
    note: string;
}

export type {
    TimeWindow,
    Enrollment,
    Entity,
    FailedStudent,
    Identifier,
    Student,
    StudentField,
    Cohort,
    Group,
    Placement,
    Plan
}