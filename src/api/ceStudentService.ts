/**
 *  cePlanService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { PageInfo, QueryModel, supabaseClient } from "@digitalaidseattle/supabase";

interface Student {
  id: string; // Adjust based on database schema
  name: string;
  age: number;
  email: string;
  city: string;
  state: string;
  country: string;
  availabilities: any[]; // Adjust based on schema
}

class CEStudentService {
  async find(_queryModel: QueryModel): Promise<PageInfo<Student>> {

    try {
      const { data, error } = await supabaseClient.from('student').select('*');

      if (error) {
        console.error('Error fetching students:', error.message);
        throw new Error('Failed to fetch students');
      }

      if (data) {
        return {
          totalRowCount: data.length,
          rows: data as Student[],
        };
      }

      return { totalRowCount: 0, rows: [] };
    } catch (err) {
      console.error('Unexpected error:', err);
      throw err;
    }
  }

  async insert(student: Student): Promise<Student> {
    try {
      const { data, error } = await supabaseClient.from('student').insert([student]).single();

      if (error) {
        console.error('Error inserting student:', error.message);
        throw new Error('Failed to insert student');
      }

      return data as Student;
    } catch (err) {
      console.error('Unexpected error during insertion:', err);
      throw err;
    }
  }

  async delete(studentId: string): Promise<void> {
    try {
      const { error } = await supabaseClient.from('student').delete().eq('id', studentId);

      if (error) {
        console.error('Error deleting student:', error.message);
        throw new Error('Failed to delete student');
      }
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      throw err;
    }
  }

  async modify(studentId: string, updatedFields: Partial<Student>): Promise<Student> {
    try {
      const { data, error } = await supabaseClient.from('student').update(updatedFields).eq('id', studentId).single();

      if (error) {
        console.error('Error updating student:', error.message);
        throw new Error('Failed to update student');
      }

      return data as Student;
    } catch (err) {
      console.error('Unexpected error during update:', err);
      throw err;
    }
  }
}

const studentService = new CEStudentService();
export { studentService };
