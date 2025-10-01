/**
 * ceStudentService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { PageInfo, QueryModel, supabaseClient } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { GENDER_OPTION } from '../constants';
import { timeWindowService } from './ceTimeWindowService';
import { EntityService } from "./entityService";
import { Cohort, Identifier, Student, TimeWindow } from "./types";

class CEStudentService extends EntityService<Student> {

  emptyStudent(): Student {
    return {
      id: uuid(),
      name: '',
      email: '',
      city: '',
      country: '',
      age: 15,
      time_zone: '',
      tz_offset: 0,
      anchor: false,
      gender: GENDER_OPTION[0],
      timeWindows: []
    } as Student;
  }

  async getCohortsForStudent(student: Student): Promise<Cohort[]> {
    try {
      return await supabaseClient
        .from('enrollment')
        .select('cohort(*)')
        .eq('student_id', student.id)
        .then(resp => resp.data!.map((json: any) => json.cohort))
    } catch (err) {
      console.error('Unexpected error:', err);
      throw err;
    }
  }

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

  async find(queryModel: QueryModel, select?: string): Promise<PageInfo<Student>> {
    return super
      .find(queryModel, select ?? '*, timewindow(*)')
      .then((pi) => {
        const updatedRows = pi.rows.map((student: any) => {
          const timeWindows = [...student.timewindow as TimeWindow[]];
          delete student.timewindow;
          return ({
            ...student,
            timeWindows: timeWindows
          })
        }
        );
        return { rows: updatedRows, totalRowCount: pi.totalRowCount }
      })
  }

  private mapToStudent(json: any): Student | null {
    if (json) {
      const student = {
        ...json,
        timeWindows: json.timewindow,
      }
      delete student.timewindow;
      return student as Student;
    }
    else {
      return null
    }
  }

  async update(entityId: Identifier, updatedFields: Partial<Student>, select?: string): Promise<Student> {
    const json = { ...updatedFields } as any;
    delete json.timeWindows;

    return super.update(entityId, json, select)
      .then(updated => this.mapToStudent(updated)!);
  }

  mapJson(json: any): Student {
    const student = {
      ...json,
      timeWindows: json.timewindow.map((js: any) => timeWindowService.mapJson(js))
    }
    delete student.timewindow
    return student
  }
  async save(student: Student): Promise<Student> {
    // inserting group before tw is required.  Group must exist before timewindow added.
    const json = { ...student }
    delete json.timeWindows;
    
    await this.insert(json);

    for (const tw of student.timeWindows!) {
      await timeWindowService.save(tw)
    }

    return student
  }
}

const studentService = new CEStudentService('student');
export { studentService };
