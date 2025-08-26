/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { v4 as uuidv4 } from 'uuid';
import { enrollmentService } from "./ceEnrollmentService";
import { groupService } from "./ceGroupService";
import { placementService } from "./cePlacementService";
import { EntityService } from "./entityService";
import { Cohort, Identifier, Placement, Plan, Student } from "./types";

// TODO consider joining to student
const DEFAULT_SELECT = '*, placement(*, student(*, timewindow(*))), grouptable(*, timewindow(*))';
const DEFAULT_GROUP_SIZE = 10;

class CEPlanService extends EntityService<Plan> {

  async create(cohort: Cohort): Promise<Plan> {
    const proposed: Plan = {
      id: uuidv4(),
      name: "New Plan",
      cohort_id: cohort.id,
      note: "",
      group_size: DEFAULT_GROUP_SIZE,
      placements: [],
      groups: []
    } as Plan;

    const inserted = await this.insert(proposed);
    return enrollmentService.getStudents(cohort)
      .then((students) => {
        const placements = students
          .map((student) => {
            return {
              plan_id: inserted.id,
              student_id: student.id,
              group_id: null,
              anchor: student.anchor || false,
              priority: 0,
            } as unknown as Placement;
          });
        return placementService.batchInsert(placements)
          .then(async () => {
            const plan = await this.getById(inserted.id)
            if (plan) {
              return plan
            }
            throw new Error (`Could not find ${inserted.id}`)
          })
      });
    throw new Error(`Could not fetch plan ${proposed.id}`)
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
      console.error("Unexpected error during select:", err);
      throw err;
    }
  }

  mapJson(json: any): Plan {
    console.log(json)
    const plan = {
      ...json,
      placements: json.placement
        .map((placementJson: any) => placementService.mapJson(placementJson)),
      groups: json.grouptable
        .map((groupJson: any) => groupService.mapJson(groupJson))
    }

    delete plan.placement;
    delete plan.grouptable;

    return plan as Plan;
  }

  async insert(plan: Plan, select?: string): Promise<Plan> {
    const json = { ...plan } as any;
    delete json.groups;
    delete json.placements;

    return super.insert(json, select ?? DEFAULT_SELECT)
      .then((resp: any) => this.mapJson(resp))

  }

  async getById(entityId: Identifier, select?: string): Promise<Plan | null> {
    return super.getById(entityId, select ?? DEFAULT_SELECT)
      .then((json: any) => this.mapJson(json))
      .catch(err => {
        console.error('Unexpected error during select:', err);
        throw err;
      });
  }

  async duplicate(plan: Plan): Promise<Plan> {
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
            }
          });
        const duplicateGroups = plan.groups
          .map(group => {
            return {
              ...group,
              plan_id: duplicatePlan.id
            }
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
      .then(resp => resp.data as Plan[]);
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
    await this.insert(plan)

    for (const group of plan.groups) {
      await groupService.save(group)
    }

    for (const placement of plan.placements) {
      await placementService.save(placement)
    }

    const saved = await this.getById(plan.id)
    if (saved) {
      return saved
    }
    throw new Error(`Could not find plan = ${plan.id}`)
  }

  async deletePlan(plan: Plan): Promise<void> {
    for (const placement of plan.placements) {
      await placementService.deletePlacement(placement);
    }
    for (const group of plan.groups) {
      await groupService.deleteGroup(group)
    }
    return await this.delete(plan.id)
  }

}

const planService = new CEPlanService('plan')
export { planService };
