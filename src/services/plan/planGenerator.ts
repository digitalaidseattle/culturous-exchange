/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { planEvaluator } from './planEvaluator';
import { GenerationSettings, generatePlan } from './planGeneration';
import { CEGroupService } from '../group/ceGroupService';
import { CETimeWindowService } from '../time/ceTimeWindowService';
import { Group, Plan } from '../../api/types';
import { MAX_GROUP_SIZE } from '../../constants';
import { CEPlanDao } from '../../api/cePlanDao';
import { CEPlacementService } from '../cePlacementService';
import { CEPlanService } from './cePlanService';

class PlanGenerator {
  private static instance: PlanGenerator;

  static getInstance() {
    if (!PlanGenerator.instance) {
      PlanGenerator.instance = new PlanGenerator();
    }
    return PlanGenerator.instance;
  }

  groupService: CEGroupService;
  timeWindowService: CETimeWindowService;
  planService: CEPlanService;

  constructor() {
    this.groupService = CEGroupService.getInstance();
    this.timeWindowService = CETimeWindowService.getInstance();
    this.planService = CEPlanService.getInstance();
  }

  /**
   * Builds the groups for a plan and saves them. The grouping itself is done by generatePlan,
   * which the New Plan window also runs to preview the result.
   */
  async run(plan: Plan, options: GenerationSettings = {}): Promise<Plan> {
    const cleaned = await this.emptyPlan(plan)

    const generated = generatePlan(cleaned.placements, {
      maxGroupSize: plan.group_size ?? MAX_GROUP_SIZE,
      optimizationStyle: plan.optimization_style,
      ...options
    }, cleaned.id);
    cleaned.groups = generated.groups;
    cleaned.placements = generated.placements;

    const evaluatedPlan = await planEvaluator.evaluate(cleaned); // to update country counts
    const finalPlan = await this.planService.save(evaluatedPlan);
    return finalPlan;
  }

  async emptyPlan(plan: Plan): Promise<Plan> {
    const planDao = CEPlanDao.getInstance();

    for (const placement of plan.placements) {
      await CEPlacementService.getInstance().updatePlacement(plan.id!, placement.student_id, { group_id: null });
      placement.group_id = undefined;
    }

    for (const group of plan.groups) {
      // TODO check if there is a batch delete
      await this.groupService.deleteGroup(group);
    }

    // requery the plan
    const emptied = await planDao.getById(plan.id!);
    if (!emptied) {
      throw new Error(`Cannot find plan: ${plan.id}!`);
    } else {
      return emptied;
    }
  }

  async createGroups(plan: Plan, nCount: number): Promise<Group[]> {
    const groups: Group[] = [];
    for (let groupNo = 1; groupNo <= nCount; groupNo++) {
      const group = {
        id: uuid(),
        plan_id: plan.id,
        name: `Group ${groupNo}`,
        country_count: 0,
        time_windows: [],
        placements: []
      } as Group;
      group.time_windows = this.groupService.createDefaultTimewindows(group);
      groups.push(group);
    }
    return groups;
  }

}

export { PlanGenerator };
