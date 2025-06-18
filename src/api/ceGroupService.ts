/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { timeWindowService } from "./ceTimeWindowService";
import { EntityService } from "./entityService";
import { Group, Placement, TimeWindow } from "./types";


class CEGroupService extends EntityService<Group> {
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
}

const groupService = new CEGroupService('grouptable')
export { groupService };
