/**
 * ceStudentService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { supabaseClient } from '@digitalaidseattle/supabase';
import { CETimeWindowDao } from './ceTimeWindowDao';
import { SupabaseDao } from './SupabaseDao';
import { Cohort, Student } from "./types";

const DEFAULT_SELECT = '*, timewindow(*)';

function ENTITY_2_JSON(entity: Partial<Student>): any {
  const json = { ...entity };
  delete json.timeWindows;
  return json;
}

function JSON_2_ENTITY(json: any): Student {
  const timeWindowDao = CETimeWindowDao.getInstance();

  const student = {
    ...json,
    timeWindows: (json.timewindow ?? []).map((js: any) => timeWindowDao.mapJson(js))
  }
  delete student.timewindow
  return student
}

class CEStudentDao extends SupabaseDao<Student> {
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

  mapJson(json: any): Student {
    return JSON_2_ENTITY(json)
  }

  mapEntity(student: Partial<Student>): any {
    return ENTITY_2_JSON(student);
  }

  async getCohortsForStudent(student: Student): Promise<Cohort[]> {
    try {
      return await supabaseClient
        .from('enrollment')
        .select('cohort(*)')
        .eq('student_id', student.id)
        .then((resp: any) => resp.data.map((json: any) => json.cohort))
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





}

export { CEStudentDao };
