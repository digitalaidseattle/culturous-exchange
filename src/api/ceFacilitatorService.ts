/**
 * ceFacilitatorService.ts
 * Service for managing facilitator profiles and their time windows.
 */
import { supabaseClient, SupabaseEntityService } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { timeWindowService } from './ceTimeWindowService';
import { Facilitator } from './types';

const DEFAULT_SELECT = '*, timewindow(*)';
function MAPPER(json: any): Facilitator {
  console.log('MAPPER', json)
  const facilitator = {
    ...json,
    timeWindows: json.timewindow ?? [] ? json.timewindow.map((js: any) => timeWindowService.mapJson(js)) : []
  }
  delete facilitator.timewindow;
  return facilitator as Facilitator;
}

class CEFacilitatorService extends SupabaseEntityService<Facilitator> {

  private static _instance: CEFacilitatorService;

  static getInstance(): CEFacilitatorService {
    if (!this._instance) {
      this._instance = new CEFacilitatorService('facilitators', DEFAULT_SELECT, MAPPER)
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

  mapJson(json: any): Facilitator {
    return MAPPER(json);
  }

  async save(facilitator: Facilitator): Promise<Facilitator> {
    const json = { ...facilitator } as any;
    delete json.timeWindows;

    const upserted = await this.upsert(json);

    // Save time windows attached to facilitator
    await timeWindowService.deleteByFacilitatorId(upserted.id!);
    for (const tw of upserted.timeWindows ?? []) {
      await timeWindowService.save(tw as any);
    }
    return upserted;
  }


  async upsert(entity: Facilitator): Promise<Facilitator> {
    try {
      const { data, error } = await supabaseClient
        .from(this.tableName)
        .upsert([entity])
        .select(this.select ?? this.select)
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
}

export { CEFacilitatorService };
