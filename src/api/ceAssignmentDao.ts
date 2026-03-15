/**
 * ceAssignmentService.ts
 * Scaffold service for managing assignments (facilitator <-> group mapping)
 */
import { supabaseClient } from '@digitalaidseattle/supabase';
import { CEFacilitatorDao } from './ceFacilitatorDao';
import { SupabaseDao } from './SupabaseDao';
import { Assignment } from './types';

const DEFAULT_SELECT = '*, facilitators(*, timewindow(*))';

function JSON_2_ENTITY(json: any): Assignment {
  const facilitatorDao = CEFacilitatorDao.getInstance();
  const facilitator = json.facilitators ?? undefined;
  const assignment = {
    ...json,
    facilitator: facilitatorDao.mapJson(facilitator)
  };

  delete assignment.facilitators;

  return assignment;
}

function ENTITY_2_JSON(entity: Assignment): any {
  const json = { ...entity };
  delete json.facilitator;
  return json;
}

export class CEAssignmentDao extends SupabaseDao<Assignment> {

  private static instance: CEAssignmentDao;

  static getInstance() {
    if (!CEAssignmentDao.instance) {
      CEAssignmentDao.instance = new CEAssignmentDao('assignment', DEFAULT_SELECT, JSON_2_ENTITY);
    }
    return CEAssignmentDao.instance;
  }

  mapJson(json: any): Assignment {
    return JSON_2_ENTITY(json);
  }

  mapEntity(entity: Assignment): any {
    return ENTITY_2_JSON(entity);
  }

  async findByGroupId(groupId: string): Promise<Assignment | null> {
    try {
      return await supabaseClient
        .from(this.tableName)
        .select(this.select)
        .eq('group_id', groupId)
        .single()
        .then((resp: any) => this.mapJson(resp.data));
    } catch (err) {
      console.error('Unexpected error fetching assignment by group id', err);
      throw err;
    }
  }


}
