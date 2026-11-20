/**
 * CEAssignmentDao.ts
 * 
 *  @copyright 2026 Digital Aid Seattle
 */
import { SupabaseConfiguration, SupabaseDAO } from "@digitalaidseattle/supabase";

import { CEFacilitatorDao } from './ceFacilitatorDao';
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

export class CEAssignmentDao extends SupabaseDAO<Assignment> {

  private static instance: CEAssignmentDao;

  static getInstance() {
    if (!CEAssignmentDao.instance) {
      CEAssignmentDao.instance = new CEAssignmentDao(SupabaseConfiguration.getInstance().getSupabaseClient(),
        'assignment',
        {
          select: DEFAULT_SELECT,
          mapper: JSON_2_ENTITY
        });
    }
    return CEAssignmentDao.instance;
  }

  mapEntity(entity: Assignment): any {
    return ENTITY_2_JSON(entity);
  }

  async findByGroupId(groupId: string): Promise<Assignment | null> {
    try {
      return await this.client
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
