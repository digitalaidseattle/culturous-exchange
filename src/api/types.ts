/**
 * types.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
type Entity = {
    id: string | number;
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
    cohort_id: string | number;
    student_id: string | number;
}

type Placement = Entity &  {
    cohort_id: string;
    student_id: string;
    student: Student;
    anchor: boolean;
    availabilities: Availability[];
}

type Plan = Entity & {
    name: string;
    cohort_id: string;
    placements: Placement[]
    groups: Group[];
    rating: number;
    notes: string;
}

export type {
    Availability,
    Enrollment,
    Entity,
    FailedStudent,
    Student,
    StudentField,
    SelectAvailability,
    Cohort,
    Group,
    Placement,
    Plan
}