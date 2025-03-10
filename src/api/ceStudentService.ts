/**
 * cePlanService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';
import { read, utils } from "xlsx";
import { EntityService } from "./entityService";
import { FailedStudent, Student } from "./types";
import { supabaseClient } from '@digitalaidseattle/supabase';

class CEStudentService extends EntityService<Student> {

  async findUnenrolled(): Promise<Student[]> {
    try {
      // TODO Scaling this may require using edge function
      const enrollment_ids = await supabaseClient
        .from('enrollment')
        .select('student_id')
        .then(resp => {
          return resp.data?.map((row: any) => row.student_id)
        })
      return supabaseClient
        .from('student')
        .select('*')
        .not('id', 'in', `(${enrollment_ids})`)
        .then((resp: any) => {
          if (resp.data) {
            return resp.data as Student[]
          }
          else {
            throw new Error('Could not execute query.')
          }
        })
    } catch (err) {
      console.error('Unexpected error:', err);
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

  async insert(entity: Partial<Student>, select?: string ): Promise<Student> {
    console.log('entity: ', entity)
    if (!entity.name || !entity.age || !entity.country || !entity.email || !entity.gender || !entity.timeZone) {
      throw new Error("Name and Email are required fields.");
    }
    const studentWithId: Student = {
      id: entity.id?? uuid(),
      name: entity.name,
      email: entity.email,
      age: entity.age,
      gender: entity.gender,
      timeZone: entity.timeZone,
      country: entity.country,
      availabilities: entity.availabilities?? []
    }
    //Below data works with current db schema:
    /*
    const studentWithId: any = {
      id: 1,
      name: entity.name,
      email: entity.email,
      age: entity.age,
      // gender: entity.gender,
      city: entity.timeZone.split('/')[1],
      state: 'CA',
      // timeZone: entity.timeZone,
      country: entity.country,
      availabilities: entity.availabilities?? []
    }
    */
    return await super.insert(studentWithId, select);
    //TODO: Add adjusted time window
  }

}

const studentService = new CEStudentService('student');
export { studentService };
