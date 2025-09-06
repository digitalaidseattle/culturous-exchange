/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { timeWindowService } from "./ceTimeWindowService";
import { EntityService } from "./entityService";
import { Group, Identifier } from "./types";


class CEGroupService extends EntityService<Group> {

  mapJson(json: any): Group | null {
    if (json) {
      const group = {
        ...json,
        placements: json.placement,
        time_windows: json.timewindow.map((js: any) => timeWindowService.mapJson(js))
      }

      delete group.placement;
      delete group.timewindow;
      return group as Group;
    }
    else {
      return null
    }
  }


  async update(entityId: Identifier, updatedFields: Partial<Group>, select?: string): Promise<Group> {
    /* The update() method updates a Group entity in the database 'grouptable', 
      excluding nested fields like placements and time_windows. */

    const json = { ...updatedFields } as any;
    delete json.placements;
    delete json.time_windows;

    return super.update(entityId, json, select)
      .then(updated => this.mapJson(updated)!);
  }

  async save(group: Group): Promise<Group> {
    // inserting group before tw is required.  Group must exist before timewindow added.
    const json = { ...group }
    delete json.placements;
    delete json.time_windows;
    await this.insert(json);

    for (const tw of group.time_windows!) {
      await timeWindowService.save(tw)
    }

    return group
  }

  async deleteGroup(group: Group) {
    for (const tw of group.time_windows!) {
      await timeWindowService.delete(tw.id)
    }
    return await this.delete(group.id)
  }

}

const groupService = new CEGroupService('grouptable')
export { groupService };
