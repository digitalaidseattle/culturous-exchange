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

type Time_Window = Entity & {
    student_id: Identifier;
    group_id: Identifier | null;
    day_in_week: string;
    start_t: string;
    end_t: string;
}

type SelectAvailability = {
    day: string;
    start: string;
    end: string;
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
    time_windows?: Time_Window[];
}

type Plan = Entity & {
    name: string;
    cohort_id: Identifier;
    placements: Placement[]
    groups: Group[];
    notes: string;
}

export type {
    Time_Window,
    Enrollment,
    Entity,
    FailedStudent,
    Identifier,
    Student,
    StudentField,
    SelectAvailability,
    Cohort,
    Group,
    Placement,
    Plan
}