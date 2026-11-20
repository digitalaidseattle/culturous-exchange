/**
 * CEFacilitatorDao.ts
 * 
 *  @copyright 2026 Digital Aid Seattle
 */
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

import { v4 as uuid } from 'uuid';
import { CETimeWindowDao } from './ceTimeWindowDao';
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

class CEFacilitatorDao extends SupabaseDAO<Facilitator> {

  private static instance: CEFacilitatorDao;

  static getInstance(): CEFacilitatorDao {
    if (!this.instance) {
      CEFacilitatorDao.instance = new CEFacilitatorDao(SupabaseConfiguration.getInstance().getSupabaseClient(), 'facilitators', {
        select: DEFAULT_SELECT,
        mapper: JSON_2_ENTITY
      });
    }
    return this.instance;
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

  async findActive(isActive: boolean): Promise<Facilitator[]> {
    return await this.client
      .from(this.tableName)
      .select(this.select)
      .eq('active', isActive)
      .then((resp: any) => resp.data.map((json: any) => this.mapJson(json)));
  }

}

export { CEFacilitatorDao };
