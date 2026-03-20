/**
 * CEAssignmentDao.ts
 * 
 *  @copyright 2026 Digital Aid Seattle
 */
import { CEFacilitatorDao } from './ceFacilitatorDao';
import { getSupabaseClient } from './Configuration';
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
      CEAssignmentDao.instance = new CEAssignmentDao(getSupabaseClient(), 'assignment', { select: DEFAULT_SELECT });
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
