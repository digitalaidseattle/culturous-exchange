/**
 * ceFacilitatorService.ts
 * Service for managing facilitator profiles and their time windows.
 */
import { supabaseClient } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { CETimeWindowDao } from './ceTimeWindowDao';
import { SupabaseDao } from './SupabaseDao';
import { Facilitator } from './types';

const DEFAULT_SELECT = '*, timewindow(*)';

function JSON_2_ENTITY(json: any): Facilitator {
  const timeWindowDao = CETimeWindowDao.getInstance();
  const facilitator = {
    ...json,
    timeWindows: (json.timewindow ?? []).map((js: any) => timeWindowDao.mapJson(js))
  }
  delete facilitator.timewindow;
  return facilitator as Facilitator;
}

function ENTITY_2_JSON(entity: Facilitator): any {
  const json = { ...entity };
  delete json.timeWindows;
  return json;
}

class CEFacilitatorDao extends SupabaseDao<Facilitator> {

  private static _instance: CEFacilitatorDao;

  static getInstance(): CEFacilitatorDao {
    if (!this._instance) {
      this._instance = new CEFacilitatorDao('facilitators', DEFAULT_SELECT, JSON_2_ENTITY)
    }
    return this._instance;
  }

  empty(): Facilitator {
    return {
      id: uuid(),
      name: '',
      email: '',
      time_zone: '',
      tz_offset: 0,
      bio: '',
      city: '',
      country: '',
      avatar_url: undefined,
      active: true,
      timeWindows: []
    } as Facilitator;
  }

  mapEntity(entity: Facilitator): any {
    return ENTITY_2_JSON(entity);
  }

  mapJson(json: any): Facilitator {
    return JSON_2_ENTITY(json);
  }

  async findActive(isActive: boolean): Promise<Facilitator[]> {
    return await supabaseClient
      .from(this.tableName)
      .select(this.select)
      .eq('active', isActive)
      .then((resp: any) => resp.data.map((json: any) => this.mapJson(json)));
  }

}

export { CEFacilitatorDao };
