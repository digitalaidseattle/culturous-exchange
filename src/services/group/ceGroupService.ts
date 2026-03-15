/**
 *  ceGroupService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { CEGroupDao } from '../../api/ceGroupDao';
import { CETimeWindowDao } from '../../api/ceTimeWindowDao';
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../time/ceTimeWindowService";
import { Group, TimeWindow } from "../../api/types";

class CEGroupService {
  private static instance: CEGroupService;

  static getInstance() {
    if (!CEGroupService.instance) {
      CEGroupService.instance = new CEGroupService();
    }
    return CEGroupService.instance;
  }

  async save(group: Group): Promise<Group> {
    const timeWindowDao = CETimeWindowDao.getInstance();

    // inserting group before tw is required.  Group must exist before timewindow added.
    const saved = await CEGroupDao.getInstance().insert(group);

    await timeWindowDao.deleteByGroupId(saved.id!);

    for (const tw of group.time_windows!) {
      await timeWindowDao.insert(tw)
    }

    return group
  }

  async deleteGroup(group: Group) {
    const timeWindowDao = CETimeWindowDao.getInstance();
    const groupDao = CEGroupDao.getInstance();

    for (const tw of group.time_windows!) {
      await timeWindowDao.delete(tw.id!)
    }
    return await groupDao.delete(group.id!)
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
