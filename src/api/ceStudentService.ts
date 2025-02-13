/**
 * cePlanService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { PageInfo, QueryModel, supabaseClient } from "@digitalaidseattle/supabase";
import { v4 as uuid } from 'uuid';
import { read, utils } from "xlsx";

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

interface FailedStudent extends Student {
  failedError: string;
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

  async get_students_from_excel(excel_file: File): Promise<Student[]> {
    try {
      const arrayBuffer = await excel_file.arrayBuffer();
      const workbook = read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: Student[] = utils.sheet_to_json(worksheet);

      // Modify data if necessary (e.g., ensure id is generated if not provided)
      data.map((student) => {
        if (!student.id) {
          student.id = uuid();
        }
        if (!student.availabilities) {
          student.availabilities = []; // Initialize empty availabilities if missing
        }
      });

      return data;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('Failed to parse Excel file');
    }
  }
  async insert_from_excel(excel_file: File): Promise<{ successCount: number; failedStudents: FailedStudent[] }> {
    try {
      const students = await this.get_students_from_excel(excel_file);
      let successCount = 0;
      const failedStudents: FailedStudent[] = [];

      for (const student of students) {
        try {
          await this.insert(student);
          successCount++;
        } catch (error) {
          const failedStudent: FailedStudent = {
            ...student,
            failedError: error instanceof Error ? error.message : 'Unknown error'
          }
          failedStudents.push(failedStudent);
          if (error instanceof Error) {
            console.error(`Failed to insert student with ID ${student.id}:`, error.message);
          } else {
            console.error(`Failed to insert student with ID ${student.id}:`, error);
          }
        }
      }

      return { successCount, failedStudents };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error processing Excel file:', error.message);
      } else {
        console.error('Error processing Excel file:', error);
      }
      throw new Error('Failed to insert students from Excel file');
    }
  }

}

const studentService = new CEStudentService();
export { studentService };
