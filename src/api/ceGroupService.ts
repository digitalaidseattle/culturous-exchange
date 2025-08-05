/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { parseISO } from "date-fns";
import { timeWindowService } from "./ceTimeWindowService";
import { EntityService } from "./entityService";
import { Group, Identifier, Placement, TimeWindow } from "./types";


class CEGroupService extends EntityService<Group> {

  private mapToGroup(json: any): Group | null {
    if (json) {
      const group = {
        ...json,
        placements: json.placement,
        time_windows: json.time_window
      }
      delete group.placement;
      delete group.timewindow;

      group.timewindows.forEach((tw: TimeWindow) => {
        tw.start_date_time = parseISO(tw.start_date_time! as unknown as string);
        tw.end_date_time = parseISO(tw.end_date_time! as unknown as string);
      });
      return group as Group;
    }
    else {
      return null
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
    /* The update() method updates a Group entity in the database 'grouptable', 
      excluding nested fields like placements and time_windows. */

    const json = { ...updatedFields } as any;
    delete json.placements;
    delete json.time_windows;

    return super.update(entityId, json, select)
      .then(updated => this.mapToGroup(updated)!);
  }

  async save(group: Group): Promise<Group> {
    for (const tw of group.time_windows!) {
      await timeWindowService.save(tw)
    }

    const json = { ...group }
    delete json.placements;
    delete json.time_windows;
    return this.update(group.id, json);
  }
}

const groupService = new CEGroupService('grouptable')
export { groupService };
