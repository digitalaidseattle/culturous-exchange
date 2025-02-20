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

type SelectAvailability = {
    day: string;
    start: string;
    end: string;
}

type Student = Entity & {
    name: string;
    age: number | null;
    email: string;
    city: string;
    state: string;
    country: string;
    availabilities: SelectAvailability[];
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
    StudentField,
    SelectAvailability,
    Cohort,
    Group,
    Placement,
    Plan
}