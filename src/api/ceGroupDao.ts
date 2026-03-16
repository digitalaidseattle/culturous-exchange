/**
 *  CEGroupDao.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { CEAssignmentDao } from './ceAssignmentDao';
import { CETimeWindowDao } from './ceTimeWindowDao';
import { getSupabaseClient } from './Configuration';
import { SupabaseDao } from './SupabaseDao';
import { Group } from './types';

const DEFAULT_SELECT = "*, timewindow(*), assignment(*, facilitators(*, timewindow(*)))";

function JSON_2_ENTITY(json: any): Group {
  const timeWindowDao = CETimeWindowDao.getInstance();
  const assignmentDao = CEAssignmentDao.getInstance();
  const group = {
    ...json,
    assignments: (json.assignment ?? []).map((js: any) => assignmentDao.mapJson(js)),
    placements: json.placement,
    time_windows: (json.timewindow ?? []).map((js: any) => timeWindowDao.mapJson(js))
  }

  delete group.assignment;
  delete group.placement;
  delete group.timewindow;

  return group;
}

function ENTITY_2_JSON(entity: Partial<Group>): any {
  const json = { ...entity } as any;
  delete json.placements;
  delete json.time_windows;
  return json;
}

export class CEGroupDao extends SupabaseDao<Group> {
  private static instance: CEGroupDao;

  static getInstance() {
    if (!CEGroupDao.instance) {
      CEGroupDao.instance = new CEGroupDao(getSupabaseClient(), 'grouptable', { select: DEFAULT_SELECT });
    }
    return CEGroupDao.instance;
  }

  mapJson(json: any): Group {
    return JSON_2_ENTITY(json);
  }

  mapEntity(entity: Partial<Group>): any {
    return ENTITY_2_JSON(entity);
  }

}

