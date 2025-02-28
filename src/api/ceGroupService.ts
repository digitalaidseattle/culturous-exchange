/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { EntityService } from "./entityService";
import { Group } from "./types";


class CEGroupService extends EntityService<Group> {

    
}

const groupService = new CEGroupService('grouptable')
export { groupService };

