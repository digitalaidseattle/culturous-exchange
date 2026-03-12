/**
 * ceAssignmentService.ts
 * Scaffold service for managing assignments (facilitator <-> group mapping)
 */
import { supabaseClient } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { EntityService } from './entityService';
import { Assignment } from './types';
import { CEFacilitatorService } from './ceFacilitatorService';

const DEFAULT_SELECT = '*';

class CEAssignmentService extends EntityService<Assignment> {

  private static instance: CEAssignmentService;

  static getInstance() {
    if (!CEAssignmentService.instance) {
      CEAssignmentService.instance = new CEAssignmentService('assignment');
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
    const facilitatorService = CEFacilitatorService.getInstance();

    const assignment = {
      ...json,
      facilitator: facilitatorService.mapJson(json.facilitators)
    };

    delete assignment.facilitators;

    return assignment;
  }

  async findByGroupId(groupId: string, select?: string): Promise<Assignment | null> {
    try {
      return await supabaseClient
        .from(this.tableName)
        .select(select ?? DEFAULT_SELECT)
        .eq('group_id', groupId)
        .single()
        .then((resp: any) => resp.data ?? null);
    } catch (err) {
      console.error('Unexpected error fetching assignment by group id', err);
      throw err;
    }
  }

}

export { CEAssignmentService };
