/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { timeWindowService } from "./ceTimeWindowService";
import { EntityService } from "./entityService";
import { Group, Identifier, Placement, TimeWindow } from "./types";


class CEGroupService extends EntityService<Group> {

  mapJson(json: any): Group {
    const group = {
      ...json,
      time_windows: json.timewindow
        .map((timeWindowJson: any) => timeWindowService.mapJson(timeWindowJson))
    }
    delete group.timewindow;
    return group;
  }
  async batchInsert(groups: Group[], select?: string): Promise<Group[]> {
    try {
      console.log(groups)
      const json = groups.map((group) => {
        const groupJson =  {
          ...group,
        }
        delete groupJson.placements;
        delete groupJson.time_windows;
        return groupJson
      });
      return super.batchInsert(json, select)
    } catch (err) {
      console.error('Unexpected error during insertion:', err);
      throw err;
    }
  }

  async getBestOverlap(
    placement: Placement,
    groups: Group[],
    maxSize: number
  ): Promise<{ bestOverlap: number | 0; bestGroup: Group | null; bestIntersect: TimeWindow[] }> {
    let bestGroup: Group | null = null;
    let bestIntersect: TimeWindow[] = [];
    let bestOverlap = 0;

    for (const group of groups) {
      if ((group.placements?.length ?? 0) >= maxSize) continue;

      const intersect = timeWindowService.intersectionTimeWindowsMultiple(
        group.time_windows ?? [],
        placement.student?.timeWindows ?? []
      );

      const overlap = await timeWindowService.overlapDuration(intersect);

      if (overlap > bestOverlap) {
        bestOverlap = overlap; // Hours of overlap
        bestGroup = group; // Group number
        bestIntersect = intersect; // Time windows intersection
      }
    }
    return { bestOverlap, bestGroup, bestIntersect };
  }

  async update(entityId: Identifier, updatedFields: Partial<Group>, select?: string): Promise<Group> {
    const json = { ...updatedFields } as any;
    delete json.placements;
    delete json.time_windows;

    return super.update(entityId, json, select)
      .then(updated => this.mapJson(updated));
  }

  async save(group: Group): Promise<Group> {
    for (const tw of group.time_windows!) {
      await timeWindowService.save(tw)
    }

    const json = { ...group }
    delete json.placements;
    delete json.time_windows;
    console.log('save', json)
    return this.insert(json);
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
