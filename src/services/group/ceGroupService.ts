/**
 *  ceGroupService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { CEGroupDao } from '../../api/ceGroupDao';
import { CETimeWindowDao } from '../../api/ceTimeWindowDao';
import { Group, TimeWindow } from "../../api/types";
import { CETimeWindowService } from "../time/ceTimeWindowService";

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
    const saved = await CEGroupDao.getInstance().upsert(group);

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
    const timewindows = timeWindowService.createDefaultTimewindows();
    timewindows.forEach(tw => tw.group_id = group.id!);
    return timewindows
  }

}

export { CEGroupService };
