/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { PageInfo, QueryModel } from "../services/supabaseClient";
import { supabaseClient } from '../services/supabaseClient';

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
      const { data, error } = await supabaseClient.from('student_tbl').select('*');

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
}

const studentService = new CEStudentService();
export { studentService };
