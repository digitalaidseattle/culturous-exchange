/**
 *  ceGroupService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { DEFAULT_TIMEZONE, timeWindowService } from "./ceTimeWindowService";
import { EntityService } from "./entityService";
import { Group, Identifier, TimeWindow } from "./types";


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

  createDefaultTimewindows(group: Group): TimeWindow[] {
    const friday = {
      id: uuid(),
      student_id: null,
      group_id: group.id,
      day_in_week: 'Friday',
      start_t: '07:00:00',
      end_t: '22:00:00',
    } as TimeWindow
    friday.start_date_time = timeWindowService.toZonedTime(0, friday.start_t, DEFAULT_TIMEZONE);
    friday.end_date_time = timeWindowService.toZonedTime(0, friday.end_t, DEFAULT_TIMEZONE);

    const saturday = {
      id: uuid(),
      student_id: null,
      group_id: group.id,
      day_in_week: 'Saturday',
      start_t: '07:00:00',
      end_t: '22:00:00',
    } as TimeWindow
    saturday.start_date_time = timeWindowService.toZonedTime(1, saturday.start_t, DEFAULT_TIMEZONE);
    saturday.end_date_time = timeWindowService.toZonedTime(1, saturday.end_t, DEFAULT_TIMEZONE);

    const sunday = {
      id: uuid(),
      student_id: null,
      group_id: group.id,
      day_in_week: 'Sunday',
      start_t: '07:00:00',
      end_t: '22:00:00',
    } as TimeWindow
    sunday.start_date_time = timeWindowService.toZonedTime(2, sunday.start_t, DEFAULT_TIMEZONE);
    sunday.end_date_time = timeWindowService.toZonedTime(2, sunday.end_t, DEFAULT_TIMEZONE);

    return [friday, saturday, sunday];
  }

}

const groupService = new CEGroupService('grouptable')
export { groupService };
