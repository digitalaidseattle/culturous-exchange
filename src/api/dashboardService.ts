import { cohortService } from "./ceCohortService";
import { studentService } from "./ceStudentService";
import { Student } from "./types";



interface StudentStats {
    students: {
        total: number;
        byAges: Record<string, number>;
        byGenders: Record<string, number>;
        byEthnicBackgrounds: Record<string, number>;
    }
    countries: {
        total: number;
        byCountries: Record<string, number>;
    }
    numberOfAcceptedStudents: number;
    numberOfFormedGroups: number;
}

interface CohortStats {
    cohortName: string;
    cohortId: string;
    byCountries: Record<string, number>;
    numberOfAnchorCandidates: number;
    numberOfWaitingCandidates: number;
}


class DashboardService {
    // getStudentCount(students: Student[]): number {
    //     return students.length;
    // }

    // getCountryCount(students: Student[]): number {
    //     const countries = new Set(students.map((student) => student.country));
    //     return countries.size;
    // }

    // Note: Good to define types for the returned data
    async getData(): Promise<any> {
        const cohorts = await cohortService.getAll();
        const students = await studentService.getAll(); 
        return  {
            totalStudents: this.getStudentCount(students),
            totalCountries: this.getCountryCount(students),
            cohortDetail: {
                cohorts: cohorts,
                cohortById: cohortService.getById("e839993a-7d68-478d-9652-af636c8b7d03")
            },
            students: {
                students: students,
            }
            
        }
    }

    // STUDENT-STATS Helper Functions
    getStudentCount(students: Student[]): number {
        return students.length;
    }

    getAgesBreakdown(students: Student[]): Record<string, number> {
        const studentByAges: Record<string, number> = {};

        students.forEach((student) => {
            const ageKey = student.age != null ? student.age.toString() : "Unknown";
            studentByAges[ageKey] = (studentByAges[ageKey] || 0) + 1;
        });

        return studentByAges;
    }

    getGenderBreakdown(students: Student[]): Record<string, number> {
        const studentByGenders: Record<string, number> = {};

        students.forEach((student) => {
            const gender = student.gender;
            studentByGenders[gender] = (studentByGenders[gender] || 0) + 1;
        });
        return studentByGenders;
    }

    getRacesBreakdown(students: Student[]): Record<string, number> {
        const races: Record<string, number> = {};
        return races;
    }

    

    getCountryCount(students: Student[]): number {
        const countries = new Set(students.map((student) => student.country));
        return countries.size;
    }

    getCountryBreakdown(students: Student[]): Record<string, number> {
        const countries:Record<string, number> = {};

        students.forEach((student) => {
            const country = student.country || "Somewhere on Earth";
            countries[country] = (countries[country] || 0) + 1;
        });
        return countries;
    }



    // COHORT-STATS Helper Functions



    // get student stats function
    async getStudentStats(): Promise<StudentStats> {
        const students = await studentService.getAll();


        const studentStats: StudentStats = {
            students: {
                total: this.getStudentCount(students),
                byAges: this.getAgesBreakdown(students),
                byGenders: this.getGenderBreakdown(students),
                byEthnicBackgrounds: {},
            },
            countries: {
                total: this.getCountryCount(students),
                byCountries: this.getCountryBreakdown(students),
            },
            numberOfAcceptedStudents: 0,
            numberOfFormedGroups: 0,
        };
        return studentStats;
    }

    // get cohort stats function
    // cohortservice -> get cohorts -> for each cohort get students -> calculate anchor students, waiting students, countries represented
    async getCohortStats(): Promise<CohortStats> {
        const cohorts = await cohortService.getAll();
        return {} as CohortStats;
    }


    



    
}

export const dashboardService = new DashboardService();