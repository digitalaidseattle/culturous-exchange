/**
 * types.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
type Identifier = string | number;

type Entity = {
    id: Identifier;
}

type Availability = {
    id: string;
    startDate: Date;
    endDate: Date;
}

type Student = Entity & {
    name: string;
    age: number | null;
    email: string;
    city: string;
    state: string;
    country: string;
    availabilities: Availability[];
}

type FailedStudent = Student & {
    failedError: string;
}

type Cohort = Entity & {
    name: string;
    plans: Plan[];
    enrolled: Student[];
}

type Group = {
    id: string | undefined;
    groupNo: string;
    studentIds: string[];
}

type Enrollment = Entity & {
    cohort_id: Identifier;
    student_id: Identifier;
}

type Placement = Entity & {
    plan_id: Identifier;
    student_id: Identifier;
    student: Student;
    anchor: boolean;
    priority: number;
    availabilities: Availability[];
}

type Plan = Entity & {
    name: string;
    cohort_id: Identifier;
    numberOfGroups: number;
    placements: Placement[];
    groups: Group[];
    rating: number;
    note: string;
}

export type {
    Availability,
    Enrollment,
    Entity,
    FailedStudent,
    Identifier,
    Student,
    Cohort,
    Group,
    Placement,
    Plan
}