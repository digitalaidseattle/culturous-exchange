/**
 * ceFacilitatorService.ts
 * Service for managing facilitator profiles and their time windows.
 */
import { supabaseClient, SupabaseEntityService } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { CETimeWindowService } from './ceTimeWindowService';
import { Facilitator } from './types';

const DEFAULT_SELECT = '*, timewindow(*)';

function JSON_2_ENTITY(json: any): Facilitator {
  const timeWindowService = CETimeWindowService.getInstance();
  const facilitator = {
    ...json,
    timeWindows: (json.timewindow ?? []).map((js: any) => timeWindowService.mapJson(js))
  }
  delete facilitator.timewindow;
  return facilitator as Facilitator;
}

function ENTITY_2_JSON(entity: Facilitator): any {
  const json = { ...entity };
  delete json.timeWindows;
  return json;
}

class CEFacilitatorDao extends SupabaseEntityService<Facilitator> {

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

  async upsert(entity: Facilitator): Promise<Facilitator> {
    try {
      const json = this.mapEntity(entity);
      const { data, error } = await supabaseClient
        .from(this.tableName)
        .upsert([json])
        .select(this.select)
        .single()
      if (error) {
        console.error('Failed to upsert entity', error);
        throw new Error('Failed to upsert entity');
      }
      return this.mapJson(data);
    } catch (err) {
      console.error('Error inserting entity:', err);
      throw err;
    }
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
