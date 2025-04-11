/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { v4 as uuidv4 } from 'uuid';
import { EntityService } from "./entityService";
import { Cohort, Group, Identifier, Placement, Plan } from "./types";
import { enrollmentService } from "./ceEnrollmentService";
import { placementService } from "./cePlacementService";
import { groupService } from "./ceGroupService";

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
            anchor: false,
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

  private createPlacements(plan: Plan, studentIds: Identifier[]): Placement[] {
    const placements = studentIds.map((studentId) => {
      return {
        plan_id: plan.id,
        student_id: studentId,
        anchor: false,
        priority: 0,
      } as Placement;
    });
    return placements;
  }

  async addStudents(plan: Plan, studentIds: Identifier[]): Promise<any> {
    try {
      const placements = this.createPlacements(plan, studentIds);
      return placementService.batchInsert(placements);
    } catch (err) {
      console.error("Unexpected error during select:", err);
      throw err;
    }
  }

  async insert(entity: Plan, select?: string): Promise<Plan> {
    return super.insert(entity, select ?? '*, placement(*)')
  }

  async getById(entityId: string | number, select?: string): Promise<Plan | null> {
    return super.getById(entityId, select ?? '*, placement(*), grouptable(*)')
      .then((dbPlan: any) => {
        if (dbPlan) {
          return {
            id: dbPlan.id,
            cohort_id: dbPlan.cohort_id,
            name: dbPlan.name,
            note: dbPlan.note,
            placements: dbPlan.placement,
            groups:
              dbPlan.grouptable ? dbPlan.grouptable.map((group: any) => {
                return {
                  id: group.id,
                  plan_id: group.plan_id,
                  name: group.name,
                  country_count: group.country_count,
                  students: []
                } as unknown as Group
              }) : []
          };
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
      note: ''
    } as unknown as Plan
    return this.insert(proposed)
      .then(async duplicatePlan => {
        console.log('duplicatePlan', duplicatePlan)
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
}

const planService = new CEPlanService('plan')
export { planService };
