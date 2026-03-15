/**
 *  ceGroupService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Identifier } from '@digitalaidseattle/core';
import { SupabaseEntityService } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { CEAssignmentService } from '../services/ceAssignmentService';
import { CETimeWindowDao } from './ceTimeWindowDao';
import { CETimeWindowService, DEFAULT_TIMEZONE } from "./ceTimeWindowService";
import { Group, TimeWindow } from "./types";

const DEFAULT_SELECT = "*, timewindow(*), assignment(*, facilitators(*, timewindow(*)))";

function MAPPER(json: any): Group {
  const timeWindowDao = CETimeWindowDao.getInstance();
  const assignmentService = CEAssignmentService.getInstance();

  const group = {
    ...json,
    assignments: (json.assignment ?? []).map((js: any) => assignmentService.mapJson(js)),
    placements: json.placement,
    time_windows: (json.timewindow ?? []).map((js: any) => timeWindowDao.mapJson(js))
  }

  delete group.assignment;
  delete group.placement;
  delete group.timewindow;

  return group;
}

class CEGroupService extends SupabaseEntityService<Group> {
  private static instance: CEGroupService;

  static getInstance() {
    if (!CEGroupService.instance) {
      CEGroupService.instance = new CEGroupService('grouptable', DEFAULT_SELECT, MAPPER);
    }
    return CEGroupService.instance;
  }

  mapJson(json: any): Group | null {
    return this.mapper(json);
  }

  async update(entityId: Identifier, updatedFields: Partial<Group>, select?: string): Promise<Group> {
    /* The update() method updates a Group entity in the database 'grouptable', 
      excluding nested fields like placements and time_windows. */

    const json = { ...updatedFields } as any;
    delete json.placements;
    delete json.time_windows;

    return super.update(entityId, json, select);
  }

  async save(group: Group): Promise<Group> {
    const timeWindowDao = CETimeWindowDao.getInstance();

    // inserting group before tw is required.  Group must exist before timewindow added.
    const json = { ...group }
    delete json.placements;
    delete json.time_windows;
    await this.insert(json, DEFAULT_SELECT);

    await timeWindowDao.deleteByGroupId(group.id!);
    for (const tw of group.time_windows!) {
      await timeWindowDao.insert(tw)
    }

    return group
  }

  async deleteGroup(group: Group) {
    const timeWindowDao = CETimeWindowDao.getInstance();

    for (const tw of group.time_windows!) {
      await timeWindowDao.delete(tw.id!)
    }
    return await this.delete(group.id!)
  }

  createDefaultTimewindows(group: Group): TimeWindow[] {
    const timeWindowService = CETimeWindowService.getInstance();

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

export { CEGroupService };
