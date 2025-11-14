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
import { Cohort, Identifier, Student } from "./types";

const DEFAULT_SELECT = '*, timewindow(*)';

class CEStudentService extends EntityService<Student> {

  // Creates an empty student object with default values (used when creating a new student form)
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

  // Fetches all cohorts that a specific student is enrolled in
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

  // Finds all students who are not enrolled in any cohort
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
        .select(DEFAULT_SELECT)
        .not('id', 'in', `(${enrollment_ids})`)
        .then((resp: any) => {
          if (resp.data) {
            return resp.data.map((student: any) => this.mapJson(student))
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
      .find(queryModel, select ?? DEFAULT_SELECT)
      .then((pageInfo) => {
        const updatedRows = pageInfo.rows.map((student: any) => this.mapJson(student))
        return { rows: updatedRows, totalRowCount: pageInfo.totalRowCount }
      })
  }

  async update(entityId: Identifier, updatedFields: Partial<Student>, select?: string): Promise<Student> {
    const json = { ...updatedFields } as any;
    delete json.timeWindows;

    return super.update(entityId, json, select)
      .then(updated => this.mapJson(updated)!);
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

    await timeWindowService.deleteByStudentId(student.id);
    for (const tw of student.timeWindows!) {
      await timeWindowService.save(tw)
    }
    // TODO get fresh instance?
    return student
  }

  async getAll(select?: string): Promise<Student[]> {
    return supabaseClient
      .from(this.tableName)
      .select(select ?? DEFAULT_SELECT)
      .then((resp: any) => {
        const json = resp.data ?? [];
        return json.map((jStudent: any) => this.mapJson(jStudent));
      })
  }
}

const studentService = new CEStudentService('student');
export { studentService };
