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

type Group =  Entity & {
    plan_id: Identifier;
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
    availabilities?: Availability[];
}

type Plan = Entity & {
    name: string;
    cohort_id: string;
    placements: Placement[]
    groups: Group[];
    notes: string;
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