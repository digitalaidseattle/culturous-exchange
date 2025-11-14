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
    getStudentCount(students: Student[]): number {
        return students.length;
    }

    getCountryCount(students: Student[]): number {
        const countries = new Set(students.map((student) => student.country));

        return countries.size;
    }

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


    async getStudentStats(): Promise<StudentStats> {
        return {} as StudentStats;
    }

    // cohortservice -> get cohorts -> for each cohort get students -> calculate anchor students, waiting students, countries represented
    async getCohortStats(): Promise<CohortStats> {
        const cohorts = await cohortService.getAll();
        return {} as CohortStats;
    }


    



    
}

export const dashboardService = new DashboardService();