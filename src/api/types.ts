import { Entity } from "./entityService";

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

type Cohort = Entity & {
    name: string;
    plans: Plan[];
}

type Group = {
    id: string | undefined;
    groupNo: string;
    studentIds: string[];
}

type Enrollment = {
    id: string;
    studentId: string;
    student: Student;
    anchor: boolean;
    availabilities: Availability[];
}

type Plan = Entity & {
    id: number;
    name: string;
    cohortId: string;
    numberOfGroups: number;
    enrollments: Enrollment[]
    groups: Group[];
    rating: number;
    notes: string;
}

export type { Availability, Student, Cohort, Group, Enrollment, Plan }