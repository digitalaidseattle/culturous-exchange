/**
 * ceStudentService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { supabaseClient } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { timeWindowService } from './ceTimeWindowService';
import { EntityService } from "./entityService";
import { Student, TimeWindow } from "./types";

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

  async insert(entity: Partial<Student>, select?: string): Promise<Student> {
    if (!entity.name || !entity.age || !entity.country || !entity.email) {
      throw new Error("Name and Email are required fields.");
    }
    const studentId = uuid();
    const studentWithId: Student = {
      ...entity,
      id: studentId
    } as Student;
    //Remove timeWindow from the student before insert
    delete studentWithId.timeWindows;
    const updatedStudent = await super.insert(studentWithId, select);

    const timeWindows = entity.timeWindows!.map(orig => {
      return {
        ...orig,
        id: uuid(),
        student_id: studentId
      } as TimeWindow
    })
    await timeWindowService.batchInsert(timeWindows)
    return updatedStudent;
  }

}

const studentService = new CEStudentService('student');
export { studentService };
