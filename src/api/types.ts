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
    facilitator_id?: Identifier | null;
    assignment_id?: Identifier | null;
    group_id: Identifier | null;
    day_in_week: string;
    start_t: string;
    end_t: string;
    start_date_time: Date;
    end_date_time: Date;
}

type CEProfile = Entity & {
    name: string;
    email: string;
    city: string;
    country: string;
    time_zone?: string;
    tz_offset: number;
    timeWindows?: TimeWindow[];
    bio?: string;
    avatar_url?: string;
}

type Student = CEProfile & {
    age: number | null;
    gender: string;
    anchor: boolean
}

type FailedStudent = Student & {
    failedError: ValidationError[];
}

type Facilitator = CEProfile & {
}

type FailedFacilitator = Facilitator & {
    failedError: ValidationError[];
}

type FailedProfile = CEProfile & {
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
    /** Whether this plan is active/enabled */
    active: boolean;
    note: string;
    group_size?: number; // Optional, can be set to override default group size
    placements: Placement[]
    assignments?: Assignment[];  // Optional, for backward compatibility
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
    duration?: number; // in hours
    placements?: Placement[];
    time_windows?: TimeWindow[];
    assignments?: Assignment[];
}

type Assignment = Entity & {
    group_id: Identifier;
    facilitator_id: Identifier | null;
    created_at?: Date;
    updated_at?: Date;
    facilitator?: Facilitator;
}

export type {
    CEProfile,
    TimeWindow,
    Enrollment,
    Entity,
    FailedFacilitator,
    FailedProfile,
    FailedStudent,
    ValidationError,
    Identifier,
    Student,
    StudentField,
    Cohort,
    Group,
    Placement,
    Plan,
    Facilitator,
    Assignment
}