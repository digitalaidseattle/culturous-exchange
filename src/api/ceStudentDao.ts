/**
 * ceStudentService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { Identifier } from '@digitalaidseattle/core';
import { supabaseClient, SupabaseEntityService } from '@digitalaidseattle/supabase';
import { CETimeWindowService } from './ceTimeWindowService';
import { Cohort, Student } from "./types";

const DEFAULT_SELECT = '*, timewindow(*)';

function ENTITY_2_JSON(entity: Partial<Student>): any {
  const json = { ...entity };
  delete json.timeWindows;
  return json;
}

function JSON_2_ENTITY(json: any): Student {
  const timeWindowService = CETimeWindowService.getInstance();

  const student = {
    ...json,
    timeWindows: (json.timewindow ?? []).map((js: any) => timeWindowService.mapJson(js))
  }
  delete student.timewindow
  return student
}

class CEStudentDao extends SupabaseEntityService<Student> {
  private static instance: CEStudentDao;

  static getInstance() {
    if (!CEStudentDao.instance) {
      CEStudentDao.instance = new CEStudentDao();
    }
    return CEStudentDao.instance;
  }

  constructor() {
    super('student', DEFAULT_SELECT, JSON_2_ENTITY);
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
    const json = this.mapEntity(updatedFields);
    return super.update(entityId, json, select)
      .then(updated => this.mapJson(updated)!);
  }

  mapJson(json: any): Student {
    return this.mapper(json)
  }

  mapEntity(student: Partial<Student>): any {
    return ENTITY_2_JSON(student);
  }

  async upsert(student: Student): Promise<Student> {
    try {
      const json = this.mapEntity(student);

      const { data, error } = await supabaseClient
        .from(this.tableName)
        .upsert([json])
        .select(this.select)
        .single();
      if (error) {
        console.error('Failed to upsert entity', error);
        throw new Error('Failed to upsert entity');
      }
      return this.mapper(data);
    } catch (err) {
      console.error('Error inserting entity:', err);
      throw err;
    }
  }

}

export { CEStudentDao };
