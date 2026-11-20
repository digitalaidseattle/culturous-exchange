/**
 *  CETimeWindowDao.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

import { SERVICE_ERRORS } from '../constants';
import { TimeWindow } from "./types";

function JSON_2_ENTITY(json: any): TimeWindow {
  return {
    ...json,
    start_date_time: json.start_date_time ? new Date(json.start_date_time + 'Z') : undefined,
    end_date_time: json.end_date_time ? new Date(json.end_date_time + 'Z') : undefined
  }
}

class CETimeWindowDao extends SupabaseDAO<TimeWindow> {
  private static instance: CETimeWindowDao;

  static getInstance() {
    if (!CETimeWindowDao.instance) {
      CETimeWindowDao.instance = new CETimeWindowDao(SupabaseConfiguration.getInstance().getSupabaseClient(),
        'timewindow',
        {
          mapper: JSON_2_ENTITY
        }
      );
    }
    return CETimeWindowDao.instance;
  }

  async deleteByGroupId(groupId: Identifier): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('group_id', groupId);
      if (error) {
        console.error(SERVICE_ERRORS.ERROR_DELETING_ENTITY, error.message);
        throw new Error(SERVICE_ERRORS.FAILED_DELETE_ENTITY);
      }
      return true;
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_DELETION, err);
      throw err;
    }
  }

  async deleteByStudentId(studentId: Identifier): Promise<boolean> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('student_id', studentId);
      if (error) {
        console.error(SERVICE_ERRORS.ERROR_DELETING_ENTITY, error.message);
        throw new Error(SERVICE_ERRORS.FAILED_DELETE_ENTITY);
      }
      return true;
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_DELETION, err);
      throw err;
    }
  }

}

export { CETimeWindowDao };
