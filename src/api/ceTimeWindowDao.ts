/**
 *  ceTimeWindowSerivce.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";
import { supabaseClient } from "@digitalaidseattle/supabase";
import { SERVICE_ERRORS } from '../constants';
import { SupabaseDao } from "./SupabaseDao";
import { TimeWindow } from "./types";

export const DEFAULT_TIMEZONE = "America/Los_Angeles";

function JSON_2_ENTITY(json: any): TimeWindow {
  return {
    ...json,
    start_date_time: json.start_date_time ? new Date(json.start_date_time + 'Z') : undefined,
    end_date_time: json.end_date_time ? new Date(json.end_date_time + 'Z') : undefined
  }
}

class CETimeWindowDao extends SupabaseDao<TimeWindow> {
  private static instance: CETimeWindowDao;

  static getInstance() {
    if (!CETimeWindowDao.instance) {
      CETimeWindowDao.instance = new CETimeWindowDao('timewindow', '*', JSON_2_ENTITY);
    }
    return CETimeWindowDao.instance;
  }

  mapJson(json: any): TimeWindow {
    return JSON_2_ENTITY(json);
  }

  async deleteByGroupId(groupId: Identifier): Promise<boolean> {
    try {
      const { error } = await supabaseClient
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

}

export { CETimeWindowDao };
