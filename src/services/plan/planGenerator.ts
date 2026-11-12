/**
 *  PlanGenerator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { planEvaluator } from './planEvaluator';
import { CEGroupService } from '../group/ceGroupService';
import { CETimeWindowService } from '../time/ceTimeWindowService';
import { Group, Placement, Plan, TimeWindow } from '../../api/types';
import { MAX_GROUP_SIZE } from '../../constants';
import { CEPlanDao } from '../../api/cePlanDao';
import { CEPlacementService } from '../cePlacementService';
import { CEPlanService } from './cePlanService';

type OverlapResult = { duration: number | 0; group: Group; intersect: TimeWindow[] };

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

  async run(plan: Plan): Promise<Plan> {
    const startTime = performance.now();
    const cleaned = await this.emptyPlan(plan)

    const nGroups = Math.ceil(cleaned.placements.length / (plan.group_size ?? MAX_GROUP_SIZE));
    cleaned.groups = await this.createGroups(cleaned, nGroups);

    const anchorPlacements = cleaned.placements.filter(p => p.anchor)
    const nonAnchorPlacements = cleaned.placements.filter(p => !p.anchor);

    const planWithAnchors = await this.assignStudents(cleaned, anchorPlacements);
    const planWithAllStudents = await this.assignStudents(planWithAnchors, nonAnchorPlacements);
    const evaluatedPlan = await planEvaluator.evaluate(planWithAllStudents); // to update country counts
    const finalPlan = await this.planService.save(evaluatedPlan);
    console.log(`PlanGenerator.run() completed in ${performance.now() - startTime} ms`);
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

  async assignStudents(plan: Plan, remainingPlacements: Placement[]): Promise<Plan> {
    // Assign each placement to the best group based on time windows
    for (const placement of remainingPlacements) {
      let overlapResults = this.getOverlap(plan, placement);
      if (overlapResults === null) {
        console.log("No suitable group found for placement", placement.student_id);
        placement.group_id = null;
      } else {
        placement.group_id = overlapResults.group.id;
        overlapResults.group.placements!.push(placement);
        overlapResults.group.time_windows = overlapResults.intersect;
      }
    }
    return plan;
  }

  getOverlap(plan: Plan, placement: Placement): OverlapResult | null {
    const overlapResults = this.getValidOverlaps(plan, placement);
    // empty group first, if there are no empty groups
    // then use the overlap strategy
    const results = overlapResults.find(r => (r.group.placements?.length ?? 0) === 0)
    if (results) {
      return results;
    } else {
      switch (plan.optimization_style) {
        case 'smallest_first':
          return this.getSmallestOverlap(overlapResults);
        case 'largest_first':
          return this.getLargestOverlap(overlapResults)
        case 'balanced':
          return this.getSmallestGroup(overlapResults)
        case 'random':
        default:
          return this.getRandom(overlapResults)
      }
    }
  }

  getSmallestGroup(overlapResults: OverlapResult[]): OverlapResult | null {
    const sortedResults = overlapResults
      .sort((a, b) => (a.group.placements?.length ?? 0) - (b.group.placements?.length ?? 0))
    return sortedResults.length > 0 ? sortedResults[0] : null;
  }

  getLargestOverlap(overlapResults: OverlapResult[]): OverlapResult | null {
    const sortedResults = overlapResults
      .sort((a, b) => {
        // Biggest overlap - descending order by overlap duration 
        const spread = b.duration - a.duration;
        if (spread !== 0) {
          return spread;
        }
        // Fill empty groups first - Ascending order by number of placements 
        return (a.group.placements?.length ?? 0) - (b.group.placements?.length ?? 0);
      })
    return sortedResults.length > 0 ? sortedResults[0] : null;
  }

  getSmallestOverlap(overlapResults: OverlapResult[]): OverlapResult | null {
    const sortedResults = overlapResults
      .sort((a, b) => {
        // smallest overlap - descending order by overlap duration 
        const spread = a.duration - b.duration;
        if (spread !== 0) {
          return spread;
        }
        // Fill empty groups first - Ascending order by number of placements 
        return (a.group.placements?.length ?? 0) - (b.group.placements?.length ?? 0);
      })
    return sortedResults.length > 0 ? sortedResults[0] : null;
  }

  getRandom(overlapResults: OverlapResult[]): OverlapResult | null {
    const shuffled = overlapResults.sort(() => Math.random() - 0.5); // Shuffle the array randomly
    return shuffled.length > 0 ? shuffled[0] : null;
  }

  getValidOverlaps(plan: Plan, placement: Placement): OverlapResult[] {
    return plan.groups
      .filter(g => (g.placements?.length ?? 0) < (plan.group_size ?? MAX_GROUP_SIZE)) // Only consider groups that are not full
      .map(group => this.createOverlapResult(group, placement))
      .filter(tuple => tuple.duration > 0)  // Only consider groups with some overlap
  }

  createOverlapResult(group: Group, placement: Placement): OverlapResult {
    const intersect = this.timeWindowService.intersectionTimeWindowsMultiple(
      group.time_windows ?? [],
      placement.student?.timeWindows ?? []
    );
    const overlap = this.timeWindowService.totalDuration(intersect);
    return { duration: overlap, group: group, intersect: intersect };
  }
}

export { PlanGenerator };
