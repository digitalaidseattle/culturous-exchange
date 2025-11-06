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

const DEFAULT_SELECT = '*, placement(*), grouptable(*)';

class CEPlanService extends EntityService<Plan> {

  async create(cohort: Cohort): Promise<Plan> {
    const proposed: Plan = {
      id: uuidv4(),
      name: "New Plan",
      cohort_id: cohort.id,
      note: "",
    } as Plan;

    return enrollmentService.getStudents(cohort).then((students) => {
      return this.insert(proposed).then((plan) => {
        const placements = students.map((student) => {
          return {
            plan_id: plan.id,
            student_id: student.id,
            anchor: student.anchor || false,
            priority: 0,
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
      console.error("Unexpected error during select:", err);
      throw err;
    }
  }

  private mapToPlan(json: any): Plan | null {
    if (json) {
      const plan = {
        ...json,
        placements: json.placement,
        groups: json.grouptable
      }
      delete plan.placement;
      delete plan.grouptable;
      return plan as Plan;
    }
    else {
      return null
    }
  }

  async insert(entity: Plan, select?: string): Promise<Plan> {
    return super.insert(entity, select ?? '*, placement(*)')
  }

  async getById(entityId: Identifier, select?: string): Promise<Plan | null> {
    return super.getById(entityId, select ?? DEFAULT_SELECT)
      .then((json: any) => {
        const plan = this.mapToPlan(json)
        if (plan) {
          return plan
        } else {
          return null
        }
      })
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

    return super.update(entityId, json, select)
      .then(updated => this.mapToPlan(updated)!);
  }

  /**
   * Set the active flag for a plan.
   * Returns the updated Plan.
   */
  async setActive(entityId: Identifier, active: boolean): Promise<Plan> {
    // Use the existing update method which will map the response back to a Plan
    return this.update(entityId, { active } as Partial<Plan>);
  }

  /**
   * Fetch only the `active` column for a plan by id.
   * Returns boolean or null if not found.
   */
  async getActiveById(entityId: Identifier): Promise<boolean | null> {
    try {
      const resp = await supabaseClient
        .from(this.tableName)
        .select('active')
        .eq('id', entityId)
        .single();
      if (resp.error) {
        throw resp.error;
      }
      return resp.data ? !!(resp.data as any).active : null;
    } catch (err) {
      console.error('Unexpected error during select active:', err);
      throw err;
    }
  }

  async save(plan: Plan): Promise<Plan> {
    for (const placement of plan.placements) {
      await placementService.save(placement)
    }
    for (const group of plan.groups) {
      await groupService.save(group)
    }
    return await this.update(plan.id, plan)
  }

}

const planService = new CEPlanService('plan')
export { planService };
