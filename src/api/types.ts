type Availability = {
    id: string;
    startDate: Date;
    endDate: Date;
}

type Student = {
    id: string;
    name: string;
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

type PlanSpec = {
    id: string;
    sessionId: string;
    numberOfGroups: number;
    enrollments: Enrollment[]
}

type Plan = {
    id: string;
    planSpecId: string;
    planSpec: PlanSpec;
    groups: Group[];
    rating: number;
    messages: string[];
}