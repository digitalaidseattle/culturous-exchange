import { List } from "lodash";
import { cohortService } from "./ceCohortService";
import { studentService } from "./ceStudentService";
import { Cohort, Student } from "./types";
import { enrollmentService } from "./ceEnrollmentService";



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
    cohortId: number | string | null | undefined;
    cohortName: string;
    byCountries: Record<string, number>;
    numberOfEnrollments: number;
    numberOfAnchorStudents: number;
    numberOfPendingStudents: number;
}


class DashboardService {
    readonly countryMap: Record<string, string> = {
        "USA": "united states",
        "us": "united states",
        "usa": "united states",
        "peru": "Peru",
        "perú": "Peru",
    }

    // STUDENT-STATS Helper Functions
    getStudentCount(students: Student[]): number {
        return students.length;
    }

    getCountryCount(students: Student[]): number {
        const countries = new Set(students.map((student) => student.country));
        return countries.size;
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

    getCountryBreakdown(students: Student[]): Record<string, number> {
        const countries:Record<string, number> = {};

        students.forEach((student) => {
            const inputCountry = student.country?.trim().toLowerCase() || "Somewhere on Earth";
            const country = this.countryMap[inputCountry] || inputCountry;
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
    async getCohortStats(): Promise<CohortStats[]> {
        const cohorts = await cohortService.getAll();
        const listOfCohortStats: CohortStats[] = [];

        for (const cohort of cohorts) {
            const cohortDetails = await this.getCohortDetails(cohort);
            listOfCohortStats.push(cohortDetails);
        }
        return listOfCohortStats;
    }


    async getCohortDetails(cohort: Cohort): Promise<CohortStats> {
        // Calculate number of anchor students
        let totalAnchor = 0;
        cohort.enrollments.forEach((student) => {
            if (student.anchor) {
                totalAnchor++;
            }
        });

        // Calculate number of countries represented
        const students = await enrollmentService.getStudents(cohort);
        const countriesByCohort = this.getCountryBreakdown(students); 


        return {
            cohortId: cohort.id,
            cohortName: cohort.name,
            byCountries: countriesByCohort,
            numberOfEnrollments: cohort.enrollments.length,
            numberOfAnchorStudents: totalAnchor,
            numberOfPendingStudents: 0,
        }
    }
}

export const dashboardService = new DashboardService();