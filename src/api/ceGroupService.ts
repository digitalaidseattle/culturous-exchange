/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { placementService } from "./cePlacementService";
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
        bestOverlap = overlap;
        bestGroup = group;
        bestIntersect = intersect;
      }
    }
    return { bestOverlap, bestGroup, bestIntersect };
  }

  async greedyGrouping(groups: Group[], maxSize: number, remainingPlacements: Placement[]): Promise<Group[]> {
    const unassignedStudents: Placement[] = [];

    for (const placement of remainingPlacements) {
      const { bestOverlap, bestGroup, bestIntersect } = await this.getBestOverlap(placement, groups, maxSize);
      // If no group is found, we can skip this placement
      if (!bestGroup) {
        unassignedStudents.push(placement);
        continue;
      }
      // If the best group is full, we can skip this placement
      if (bestGroup.placements?.length ?? 0 >= maxSize) {
        unassignedStudents.push(placement);
        continue;
      }
      // If the best group is not full, we can assign this placement to the group

      // Assign best group to the current placement
      if (bestGroup && bestOverlap > 0) {
        placement.group_id = bestGroup.id;
        placement.group = bestGroup;

        // Find and update the group in the groups array
        const groupIndex = groups.findIndex(g => g.id === bestGroup.id);
        if (groupIndex !== -1) {
          groups[groupIndex].placements = groups[groupIndex].placements || [];
          groups[groupIndex].placements.push(placement);
          groups[groupIndex].time_windows = bestIntersect;
        }

        await placementService.updatePlacement(
          placement.plan_id,
          placement.student_id,
          { group_id: bestGroup.id }
        );
      } else {
        // Save for fallback
        unassignedStudents.push(placement);
      }
    }
    return groups;
  }
}

const groupService = new CEGroupService('grouptable')
export { groupService };
