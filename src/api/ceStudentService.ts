/**
 * ceStudentService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';
import { EntityService } from "./entityService";
import { Student, TimeWindow } from "./types";
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
