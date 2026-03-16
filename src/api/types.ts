/**
 * types.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */

import { Entity, Identifier } from "@digitalaidseattle/core";

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
    active: boolean;
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

// TODO table does not have an ID column
type Enrollment = Entity & {
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
    groups: Group[];
}

// TODO table does not have an ID column
type Placement = Entity & {
    plan_id: Identifier;
    student_id: Identifier;
    group_id?: Identifier | null; // will be null when unassigned
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
    group_id: Identifier | null;
    facilitator_id: Identifier | null;
    created_at?: Date;
    updated_at?: Date;
    facilitator?: Facilitator;
}

type TimeSlot = Partial<TimeWindow> & {
    label: string;
    day_in_week: string;
    start_t: string;
    end_t: string;
}

const GENDER_OPTION = ['Female', 'Male', 'Other']

export { GENDER_OPTION };

export type {
    CEProfile,
    TimeWindow,
    TimeSlot,
    Enrollment,
    FailedFacilitator,
    FailedProfile,
    FailedStudent,
    ValidationError,
    Student,
    StudentField,
    Cohort,
    Group,
    Placement,
    Plan,
    Facilitator,
    Assignment
}