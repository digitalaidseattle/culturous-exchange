/**
 * types.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
type Identifier = string | number | undefined | null;

type Entity = {
    id: Identifier;
}

type TimeWindow = Entity & {
    student_id: Identifier | null;
    group_id: Identifier | null;
    day_in_week: string;
    start_t: string;
    end_t: string;
    start_date_time?: Date;  // FIXME mark as optional until DB updated
    end_date_time?: Date;  // FIXME mark as optional until DB updated
}

type Student = Entity & {
    name: string;
    age: number | null;
    email: string;
    city?: string; // FIXME mark as optional until DB updated
    country: string;
    gender: string;
    time_zone?: string; 
    tz_offset: number; 
    timeWindows?: TimeWindow[]; 
    anchor: boolean
}

type FailedStudent = Student & {
    failedError: ValidationError[];
}

type ValidationError = { isValid?: boolean; field?: string; message?: string; }

type StudentField = {
    key: keyof Student;
    label: string;
    type: string;
    required: boolean;
}

type Cohort = Entity & {
    name: string;
    plans: Plan[];
    enrollments: Enrollment[];
}

type Enrollment = {
    cohort_id: Identifier;
    student_id: Identifier;
    student?: Student;
    /**
     * Whether this student is an anchor student for the cohort.
     * Anchor students are key participants that should be prioritized in group assignments.
     */
    anchor: boolean;
}

type Plan = Entity & {
    name: string;
    cohort_id: Identifier;
    note: string;
    group_size?: number; // Optional, can be set to override default group size
    placements: Placement[]
    groups: Group[];
}

type Placement = {
    plan_id: Identifier;
    student_id: Identifier;
    group_id?: Identifier; // will be null when unassigned
    student?: Student;
    /**
     * Whether this student is an anchor student for the plan.
     * Anchor students are key participants that should be prioritized in group assignments.
     */
    anchor: boolean;

    /**
     * Priority level of the student in this plan.
     * 0 = normal priority
     * 1 = high priority
     */
    priority: number;
}

type Group = Entity & {
    plan_id: Identifier;
    name: string;
    country_count: number;
    placements?: Placement[];
    time_windows?: TimeWindow[];
}

export type {
    TimeWindow,
    Enrollment,
    Entity,
    FailedStudent,
    ValidationError,
    Identifier,
    Student,
    StudentField,
    Cohort,
    Group,
    Placement,
    Plan
}