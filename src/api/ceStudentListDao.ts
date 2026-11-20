/**
 * CEStudentDao.ts
 *
 * @copyright 2026 Digital Aid Seattle
 *
 */
import { CETimeWindowDao } from './ceTimeWindowDao';
import { getSupabaseClient } from './Configuration';
import { SupabaseDao } from './SupabaseDao';
import { Cohort, Student } from "./types";

const DEFAULT_SELECT = '*, timewindow(*), enrollment(*, cohort(*))';

export type EnrolledStudent = Student & {
  cohorts: Cohort[];
}

function JSON_2_ENTITY(json: any): EnrolledStudent {
  const timeWindowDao = CETimeWindowDao.getInstance();
  const student = {
    ...json,
    timeWindows: (json.timewindow ?? []).map((js: any) => timeWindowDao.mapJson(js)),
    cohorts: (json.enrollment ?? []).map((js: any) => js.cohort as Cohort)
  }
  delete student.timewindow
  delete student.enrollment
  return student
}

class CEStudentListDao extends SupabaseDao<EnrolledStudent> {
  private static instance: CEStudentListDao;

  static getInstance() {
    if (!CEStudentListDao.instance) {
      CEStudentListDao.instance = new CEStudentListDao(getSupabaseClient(), 'student', { select: DEFAULT_SELECT });
    }
    return CEStudentListDao.instance;
  }

  mapJson(json: any): EnrolledStudent {
    return JSON_2_ENTITY(json)
  }
}

export { CEStudentListDao };
