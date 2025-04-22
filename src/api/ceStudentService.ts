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
import { FailedStudent, Student, TimeWindow } from "./types";

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

    // FIXME remove when time_zone added
    // delete studentWithId.time_zone;
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

  async insertSingle(student: Student, selection: string[]): Promise<{ success: boolean, student: Student | FailedStudent }> {
    try {
      const partialWindows = timeWindowService.mapTimeWindows(selection);
      student.timeWindows = partialWindows as TimeWindow[];
      const tzData = await timeWindowService.getTimeZone(student.city!, student.country);
      student.time_zone = tzData.timezone;
      timeWindowService.adjustTimeWindows(student, tzData.offset);
      const inserted = await this.insert(student);
      return { success: true, student: inserted}
    } catch (err: any) {
      console.error(`Failed to insert student ${student.name}`, err);
      return { success: false, student: {...student, failedError:  err.message} }
    }
  }

}

const studentService = new CEStudentService('student');
export { studentService };
