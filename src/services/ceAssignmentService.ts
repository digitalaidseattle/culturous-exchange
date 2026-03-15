/**
 * ceAssignmentService.ts
 * Scaffold service for managing assignments (facilitator <-> group mapping)
 */
import { v4 as uuid } from 'uuid';
import { Assignment } from '../api/types';

class CEAssignmentService {

  private static instance: CEAssignmentService;

  static getInstance() {
    if (!CEAssignmentService.instance) {
      CEAssignmentService.instance = new CEAssignmentService();
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

}

export { CEAssignmentService };
