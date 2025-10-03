/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { timeWindowService } from "./ceTimeWindowService";
import { Cohort, Enrollment, Identifier, Student } from "./types";

class CEEnrollmentService {
    tableName = '';

    constructor(tableName: string) {
        this.tableName = tableName;
    }
    async updateEnrollment(cohortId: Identifier, studentId: Identifier, updatedFields: Partial<Enrollment>, select?: string): Promise<Enrollment> {
        try {
            const { data, error } = await supabaseClient.from(this.tableName)
                .update(updatedFields)
                .eq('cohort_id', cohortId)
                .eq('student_id', studentId)
                .select(select ?? '*')
                .single();
            if (error) {
                console.error('Error updating entity:', error.message);
                throw new Error('Failed to update entity');
            }
            return data as unknown as Enrollment;
        } catch (err) {
            console.error('Unexpected error during update:', err);
            throw err;
        }
    }

    // TODO returning timewindow as object instead of array
    async getStudents(cohort: Cohort): Promise<Student[]> {
        return await supabaseClient
            .from('enrollment')
            .select('student(*, timewindow(*))')
            .eq('cohort_id', cohort.id)
            .then(resp => {
                return resp.data!.map((json: any) => {
                    const timeWindows = json.student.timewindow.map((tw: any) => timeWindowService.mapJson(tw));
                    json.student.timeWindows = timeWindows;
                    delete json.student.timewindow;
                    return json.student as Student;
                })
            });
    }

    async deleteEnrollment(enrollment: Enrollment): Promise<void> {
        try {
            const { error } = await supabaseClient
                .from(this.tableName)
                .delete()
                .eq('cohort_id', enrollment.cohort_id)
                .eq('student_id', enrollment.student_id);
            if (error) {
                console.error('Error deleting entity:', error.message);
                throw new Error('Failed to delete entity');
            }
        } catch (err) {
            console.error('Unexpected error during deletion:', err);
            throw err;
        }
    }

    async batchInsert(entities: Enrollment[], select?: string): Promise<Enrollment[]> {
        try {
            const { data, error } = await supabaseClient
                .from(this.tableName)
                .insert(entities)
                .select(select ?? '*');
            if (error) {
                console.error('Error inserting entity:', error);
                throw new Error('Failed to insert entity: ' + error.message);
            }
            return data as unknown as Enrollment[];
        } catch (err) {
            console.error('Unexpected error during insertion:', err);
            throw err;
        }
    }


}

const enrollmentService = new CEEnrollmentService('enrollment')
export { enrollmentService };

