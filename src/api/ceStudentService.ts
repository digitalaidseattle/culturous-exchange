/**
 * cePlanService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';
import { read, utils } from "xlsx";
import { EntityService } from "./entityService";
import { FailedStudent, Student, TimeWindow } from "./types";
import { supabaseClient } from '@digitalaidseattle/supabase';
import { timeWindowService } from './ceTimeWindowService';

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

  changeToLowercase(object: any): any {
    const lowered: { [key: string]: any } = {};
    Object.keys(object).forEach(key => {
      lowered[key.toLowerCase().trim()] = object[key];
    })

    return lowered;
  }


  mapTimeWindows(entries: string[]): Partial<TimeWindow>[] {
    let timeWindows: Partial<TimeWindow>[] = [];
    entries.forEach(entry => {
      timeWindows = timeWindows.concat(this.createTimeWindows(entry))
    });
    return timeWindows;
  }

  createTimeWindows(entry: string): Partial<TimeWindow>[] {
    switch (entry.trim()) {
      case "All options work for me":
        return [
          { day_in_week: 'Friday', start_t: '07:00:00', end_t: '12:00:00' },
          { day_in_week: 'Friday', start_t: '12:00:00', end_t: '17:00:00' },
          { day_in_week: 'Friday', start_t: '17:00:00', end_t: '22:00:00' },
          { day_in_week: 'Saturday', start_t: '07:00:00', end_t: '12:00:00' },
          { day_in_week: 'Saturday', start_t: '12:00:00', end_t: '17:00:00' },
          { day_in_week: 'Saturday', start_t: '17:00:00', end_t: '22:00:00' },
          { day_in_week: 'Sunday', start_t: '07:00:00', end_t: '12:00:00' },
          { day_in_week: 'Sunday', start_t: '12:00:00', end_t: '17:00:00' },
          { day_in_week: 'Sunday', start_t: '17:00:00', end_t: '22:00:00' }
        ];
      case "Friday morning (7am-12pm)":
        return [{ day_in_week: 'Friday', start_t: '07:00:00', end_t: '12:00:00' }];
      case "Friday afternoon (12pm-5 pm)":
        return [{ day_in_week: 'Friday', start_t: '12:00:00', end_t: '17:00:00' }];
      case "Friday evening (5pm-10pm)":
        return [{ day_in_week: 'Friday', start_t: '17:00:00', end_t: '22:00:00' }];
      case "Saturday morning (7am-12pm)":
        return [{ day_in_week: 'Saturday', start_t: '07:00:00', end_t: '12:00:00' }];
      case "Saturday afternoon (12pm-5pm)":
        return [{ day_in_week: 'Saturday', start_t: '12:00:00', end_t: '17:00:00' }];
      case "Saturday evening (5pm-10pm)":
        return [{ day_in_week: 'Saturday', start_t: '17:00:00', end_t: '22:00:00' }];
      case "Sunday morning (7am-12pm)":
        return [{ day_in_week: 'Sunday', start_t: '07:00:00', end_t: '12:00:00' }];
      case "Sunday afternoon (12pm-5pm)":
        return [{ day_in_week: 'Sunday', start_t: '12:00:00', end_t: '17:00:00' }];
      case "Sunday evening (5pm-10pm)":
        return [{ day_in_week: 'Sunday', start_t: '17:00:00', end_t: '22:00:00' }];
      default:
        return [];
    }
  }

  createStudent(dict: any): Student {
    const times = dict['please mark all times that would be possible for the online group session on the weekend (based in your time zone)'];
    return {
      name: dict['first/given name in english'].trim() + ' ' + dict['last/sur/family name in english'].trim(),
      age: Number.parseInt(dict['your age (how old are you currently)']),
      email: dict['email address'],
      country: dict['home country:'].trim(),
      gender: dict['gender'].trim(),
      original: this.mapTimeWindows(times.split(','))
    } as Student
  }

  async get_students_from_excel(excel_file: File): Promise<Student[]> {
    try {
      const arrayBuffer = await excel_file.arrayBuffer();
      const workbook = read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any[] = utils.sheet_to_json(worksheet);

      // Modify data if necessary (e.g., ensure id is generated if not provided)
      return data
        .map(dict => this.changeToLowercase(dict))
        .map((dict) => this.createStudent(dict));
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


  //FIX ME - temp static fields added for gender and time_zone
  async insert(entity: Partial<Student>, select?: string): Promise<Student> {
    if (!entity.name || !entity.age || !entity.country || !entity.email) {
      throw new Error("Name and Email are required fields.");
    }
    const studentWithId: Student = {
      ...entity,
      id: uuid()
    } as Student;

    delete studentWithId.original;
    // FIXME remove when time_zone added
    delete studentWithId.time_zone;
    const timeWindows = entity.original!.map(orig => {
      return {
        ...orig,
        id: uuid(),
        student_id: studentWithId.id,
      }
    })

    const updatedStudent = await super.insert(studentWithId, select);
    await timeWindowService.batchInsert(timeWindows)
    return updatedStudent;
  }

}

const studentService = new CEStudentService('student');
export { studentService };
