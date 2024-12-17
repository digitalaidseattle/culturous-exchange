type Availability = {
    id: string;
    startDate: Date;
    endDate: Date;
}

type Student = {
    id: string;
    name: string;
    age: number | null;
    email: string;
    city: string;
    state: string;
    country: string;
    availabilities: Availability[];
}

type Session = {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
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

type Plan = {
    id: string;
    name: string;
    sessionId: string;
    numberOfGroups: number;
    enrollments: Enrollment[]
    groups: Group[];
    rating: number;
    comments: string[];
}