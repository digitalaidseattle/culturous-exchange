/**
 * ceAssignmentService.ts
 * Scaffold service for managing assignments (facilitator <-> group mapping)
 */
import { supabaseClient, SupabaseEntityService } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { CEFacilitatorDao } from '../api/ceFacilitatorDao';
import { Assignment } from '../api/types';

const DEFAULT_SELECT = '*, facilitators(*, timewindow(*))';

function MAPPER(json: any): Assignment {
  const facilitatorDao = CEFacilitatorDao.getInstance();
  const facilitator = json.facilitators ?? undefined;
  const assignment = {
    ...json,
    facilitator: facilitatorDao.mapJson(facilitator)
  };

  delete assignment.facilitators;

  return assignment;
}

class CEAssignmentService extends SupabaseEntityService<Assignment> {

  private static instance: CEAssignmentService;

  static getInstance() {
    if (!CEAssignmentService.instance) {
      CEAssignmentService.instance = new CEAssignmentService('assignment', DEFAULT_SELECT, MAPPER);
    }
    return CEAssignmentService.instance;
  }

  empty(): Assignment {
    return {
      id: uuid(),
      group_id: null,
      facilitator_id: null
    } as Assignment;
  }

  mapJson(json: any): Assignment {
    return MAPPER(json);
  }

  async findByGroupId(groupId: string, select?: string): Promise<Assignment | null> {
    try {
      return await supabaseClient
        .from(this.tableName)
        .select(select ?? DEFAULT_SELECT)
        .eq('group_id', groupId)
        .single()
        .then((resp: any) => resp.data ? this.mapJson(resp.data) : null);
    } catch (err) {
      console.error('Unexpected error fetching assignment by group id', err);
      throw err;
    }
  }

  async insert(entity: Assignment): Promise<Assignment> {
    const json = {
      ...entity
    }
    delete json.facilitator;
    return await super.insert(entity);
  }

}

export { CEAssignmentService };
