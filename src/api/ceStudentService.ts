/**
 * cePlanService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';
import { read, utils } from "xlsx";
import { EntityService } from "./entityService";
import { Student } from "./types";

class CEStudentService extends EntityService<Student> {

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

const studentService = new CEStudentService('student');
export { studentService };
