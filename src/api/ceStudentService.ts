/**
 * ceStudentService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { Identifier } from '@digitalaidseattle/core';
import { supabaseClient, SupabaseEntityService } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { GENDER_OPTION } from '../constants';
import { CETimeWindowService } from './ceTimeWindowService';
import { Cohort, Student } from "./types";

const DEFAULT_SELECT = '*, timewindow(*)';

function MAPPER(json: any): Student {
  const timeWindowService = CETimeWindowService.getInstance();

  const student = {
    ...json,
    timeWindows: (json.timewindow ?? []).map((js: any) => timeWindowService.mapJson(js))
  }
  delete student.timewindow
  return student
}

class CEStudentService extends SupabaseEntityService<Student> {
  private static instance: CEStudentService;

  static getInstance() {
    if (!CEStudentService.instance) {
      CEStudentService.instance = new CEStudentService();
    }
    return CEStudentService.instance;
  }

  private timeWindowService: CETimeWindowService;

  constructor() {
    super('student', DEFAULT_SELECT, MAPPER);
    this.timeWindowService = CETimeWindowService.getInstance();
  }

  empty(): Student {
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
        .then((resp: any) => resp.data!.map((json: any) => json.cohort))
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
        .then((resp: any) => {
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

  async update(entityId: Identifier, updatedFields: Partial<Student>, select?: string): Promise<Student> {
    const json = { ...updatedFields } as any;
    delete json.timeWindows;

    return super.update(entityId, json, select)
      .then(updated => this.mapJson(updated)!);
  }

  mapJson(json: any): Student {
    return this.mapper(json)
  }

  async save(student: Student): Promise<Student> {
    // inserting group before tw is required.  Group must exist before timewindow added.
    const json = { ...student }
    delete json.timeWindows;

    await this.insert(json);

    await this.timeWindowService.deleteByStudentId(student.id!);
    for (const tw of student.timeWindows!) {
      await this.timeWindowService.save(tw)
    }
    // TODO get fresh instance?
    return student
  }

}

export { CEStudentService };
