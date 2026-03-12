/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";
import { supabaseClient, SupabaseEntityService } from "@digitalaidseattle/supabase";
import { v4 as uuidv4 } from 'uuid';
import { SERVICE_ERRORS, UI_STRINGS } from '../constants';
import { enrollmentService } from "./ceEnrollmentService";
import { CEGroupService } from "./ceGroupService";
import { placementService } from "./cePlacementService";
import { Cohort, Group, Placement, Plan, Student } from "./types";

const DEFAULT_SELECT = '*, placement(*, student(*, timewindow(*))), grouptable(*, timewindow(*), assignment(*, facilitators(*, timewindow(*))))';

function MAPPER(json: any): Plan {
  const groupService = CEGroupService.getInstance();

  const plan = {
    ...json,
    placements: json.placement.map((pJson: any) => placementService.mapJson(pJson)),
    groups: json.grouptable.map((gJson: any) => groupService.mapJson(gJson))
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

class CEPlanService extends SupabaseEntityService<Plan> {
  private static instance: CEPlanService;

  static getInstance() {
    if (!CEPlanService.instance) {
      CEPlanService.instance = new CEPlanService('plan', DEFAULT_SELECT, MAPPER);
    }
    return CEPlanService.instance;
  }


  async create(cohort: Cohort): Promise<Plan> {
    const proposed: Plan = {
      id: uuidv4(),
      name: UI_STRINGS.NEW_PLAN,
      cohort_id: cohort.id,
      note: "",
      group_size: 10,
      placements: [],
      groups: [],
      active: false,
    } as Plan;
    await this.save(proposed)
    return this.insert(proposed)
      .then((plan) => {
        return enrollmentService.getStudents(cohort)
          .then((students) => {
            const placements = students.map((student) => {
              return {
                plan_id: plan.id,
                student_id: student.id,
                anchor: student.anchor || false,
                priority: 0,
                student: student
              } as unknown as Placement;
            });
            return placementService
              .batchInsert(placements)
              .then((createdPlacements) => {
                plan.placements = createdPlacements;
                return plan;
              });
          });
      });
  }

  createPlacements(plan: Plan, students: Student[]): Placement[] {
    const placements = students.map((student) => {
      return {
        plan_id: plan.id,
        student_id: student.id,
        anchor: student.anchor || false,
        priority: 0,
      } as Placement;
    });
    return placements;
  }

  async addStudents(plan: Plan, students: Student[]): Promise<any> {
    try {
      const placements = this.createPlacements(plan, students);
      return placementService.batchInsert(placements);
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
      throw err;
    }
  }

  mapJson(json: any): Plan {
    return this.mapper(json);
  }

  async insert(entity: Plan, select?: string): Promise<Plan> {
    const json = { ...entity } as any;
    delete json.groups;
    delete json.placements;

    return super.insert(json, select ?? DEFAULT_SELECT)
      .then((resp: any) => this.mapJson(resp))
      .catch(err => {
        console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
        throw err;
      });
  }

  async duplicate(plan: Plan): Promise<Plan> {
    const groupService = CEGroupService.getInstance();

    const proposed: Plan = {
      id: uuidv4(),
      cohort_id: plan.cohort_id,
      name: plan.name + ' (copy)',
      note: '',
    } as unknown as Plan
    return this.insert(proposed)
      .then(async duplicatePlan => {
        const duplicatePlacements = plan.placements
          .map(placement => {
            return {
              ...placement,
              plan_id: duplicatePlan.id
            } as Placement;
          });
        const duplicateGroups = plan.groups
          .map(group => {
            return {
              ...group,
              plan_id: duplicatePlan.id
            } as Group;
          });
        return Promise
          .all([
            placementService.batchInsert(duplicatePlacements),
            groupService.batchInsert(duplicateGroups)
          ])
          .then(resps => {
            duplicatePlan.placements = resps[0];
            duplicatePlan.groups = resps[1];
            return duplicatePlan;
          })
      })
  }

  async findByCohortId(cohort_id: Identifier): Promise<Plan[]> {
    return await supabaseClient
      .from(this.tableName)
      .select('*')
      .eq('cohort_id', cohort_id)
      .then((resp: any) => resp.data as Plan[]);
  }

  async removeStudents(plan: Plan, studentIds: Identifier[]): Promise<any> {
    // Loops over each id and returns a new array of placement objects
    return Promise.all(
      studentIds.map((id) =>
        placementService.deletePlacement({
          plan_id: plan.id,
          student_id: id,
        } as Placement)
      )
    ).then(() => true);
  }

  async update(entityId: Identifier, updatedFields: Partial<Plan>, select?: string): Promise<Plan> {
    const json = { ...updatedFields } as any;
    delete json.groups;
    delete json.placements;

    return super.update(entityId, json, select ?? DEFAULT_SELECT)
      .then(updated => this.mapJson(updated)!);
  }

  async save(plan: Plan): Promise<Plan> {
    const groupService = CEGroupService.getInstance();

    await this.insert(plan)
    for (const group of plan.groups) {
      await groupService.save(group)
    }
    for (const placement of plan.placements) {
      await placementService.save(placement)
    }
    return plan
  }


  async deletePlan(plan: Plan): Promise<void> {
    const groupService = CEGroupService.getInstance();

    for (const placement of plan.placements) {
      await placementService.deletePlacement(placement);
    }
    for (const group of plan.groups) {
      await groupService.deleteGroup(group)
    }
    return await this.delete(plan.id!)
  }

}

const planService = new CEPlanService('plan')
export { planService };
