/**
 * ceFacilitatorService.ts
 * Minimal scaffold for facilitator CRUD to support the new schema.
 */
import { supabaseClient } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { timeWindowService } from './ceTimeWindowService';
import { EntityService } from './entityService';
import { Facilitator } from './types';

const DEFAULT_SELECT = '*, timewindow(*)';

class CEFacilitatorService extends EntityService<Facilitator> {

  emptyFacilitator(): Facilitator {
    return {
      id: uuid(),
      name: '',
      email: '',
      time_zone: '',
      tz_offset: 0,
      bio: '',
      avatar_url: undefined,
      active: true,
      timeWindows: []
    } as Facilitator;
  }

  mapJson(json: any): Facilitator {
    const facilitator = {
      ...json,
      timeWindows: json.timewindow ? json.timewindow.map((js: any) => timeWindowService.mapJson(js)) : []
    }
    delete (facilitator as any).timewindow;
    return facilitator as Facilitator;
  }

  async save(facilitator: Facilitator): Promise<Facilitator> {
    const json = { ...facilitator } as any;
    delete json.timeWindows;

    await this.insert(json);

    // Save time windows attached to facilitator
    await timeWindowService.deleteByFacilitatorId(facilitator.id);
    for (const tw of facilitator.timeWindows ?? []) {
      await timeWindowService.save(tw as any);
    }
    return facilitator;
  }

  async getAll(select?: string): Promise<Facilitator[]> {
    return supabaseClient
      .from(this.tableName)
      .select(select ?? DEFAULT_SELECT)
      .then((resp: any) => {
        const json = resp.data ?? [];
        return json.map((jFac: any) => this.mapJson(jFac));
      })
  }

}

const facilitatorService = new CEFacilitatorService('facilitators');
export { facilitatorService };
