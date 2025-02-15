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
    cohort_id: string | number;
    student_id: string | number;
}

type Placement = {
    id: string;
    cohortId: string;
    studentId: string;
    student: Student;
    anchor: boolean;
    availabilities: Availability[];
}

type Plan = Entity & {
    name: string;
    cohortId: string;
    numberOfGroups: number;
    enrollments: Enrollment[]
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
    Cohort,
    Group,
    Placement,
    Plan
}