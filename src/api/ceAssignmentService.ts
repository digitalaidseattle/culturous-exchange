/**
 * ceAssignmentService.ts
 * Scaffold service for managing assignments (facilitator <-> group mapping)
 */
import { supabaseClient, SupabaseEntityService } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { CEFacilitatorService } from './ceFacilitatorService';
import { Assignment } from './types';

const DEFAULT_SELECT = '*';

function MAPPER(json: any): Assignment {
  const facilitatorService = CEFacilitatorService.getInstance();

  const assignment = {
    ...json,
    facilitator: facilitatorService.mapJson(json.facilitators)
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
      group_id: undefined,
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

}

export { CEAssignmentService };
