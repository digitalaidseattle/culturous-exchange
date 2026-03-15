/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";
import { supabaseClient } from "@digitalaidseattle/supabase";
import { CEGroupService } from "./ceGroupService";
import { SupabaseDao } from "./SupabaseDao";
import { Group, Placement, Plan } from "./types";
import { CEPlacementService } from "../services/cePlacementService";

const DEFAULT_SELECT = '*, placement(*, student(*, timewindow(*))), grouptable(*, timewindow(*), assignment(*, facilitators(*, timewindow(*))))';

function JSON_2_ENTITY(json: any): Plan {
  const groupService = CEGroupService.getInstance();
  const placementService = CEPlacementService.getInstance();

  const plan = {
    ...json,
    placements: (json.placement ?? []).map((pJson: any) => placementService.mapJson(pJson)),
    groups: (json.grouptable ?? []).map((gJson: any) => groupService.mapJson(gJson))
  }

  delete plan.placement;
  delete plan.grouptable;

  // initialize placements in each group
  plan.groups.forEach((group: Group) => group.placements = []);
  plan.placements.forEach((p: Placement) => {
    const group = plan.groups.find((g: Group) => g.id === p.group_id);
    if (group) {
      group.placements.push(p);
    }
  });
  return plan as Plan;
}

function ENTITY_2_JSON(entity: Partial<Plan>): any {
  const json = { ...entity };
  delete json.placements;
  delete json.assignments;
  delete json.groups;
  return json;
}

export class CEPlanDao extends SupabaseDao<Plan> {
  private static instance: CEPlanDao;

  static getInstance() {
    if (!CEPlanDao.instance) {
      CEPlanDao.instance = new CEPlanDao('plan', DEFAULT_SELECT, JSON_2_ENTITY);
    }
    return CEPlanDao.instance;
  }

  mapJson(json: any): Plan {
    return JSON_2_ENTITY(json);
  }

  mapEntity(entity: Plan): any {
    return ENTITY_2_JSON(entity);
  }

  async findByCohortId(cohort_id: Identifier): Promise<Plan[]> {
    return await supabaseClient
      .from(this.tableName)
      .select('*')
      .eq('cohort_id', cohort_id)
      .then((resp: any) => resp.data.map((json: any) => this.mapJson(json)));
  }

}

