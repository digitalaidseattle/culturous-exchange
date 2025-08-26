/**
 *  cePlacementService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { enrollmentService } from "./ceEnrollmentService";
import { Cohort, Group, Identifier, Placement, Plan, Student } from "./types";
import { studentService } from "./ceStudentService";


class CEPlacementService {
  tableName = '';

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // TODO : NEW, there's something wrong with original findByPlanId need FIX.
  async findByPlan(planId: Identifier): Promise<Placement[]> {
    return await supabaseClient
      .from('placement')
      .select('*')
      .eq('plan_id', planId)
      .then(resp => {
        return resp.data as Placement[] || [];
      });
  }

  async findByPlanId(planId: Identifier): Promise<Placement[]> {
    return await supabaseClient
      .from('placement')
      .select('*, student(*), grouptable(*)')
      .eq('plan_id', planId)
      .then(resp => {
        if (resp.data) {

          return resp.data.map(db => {
            const grouptable = db['grouptable'] as Group[];
            const student = db['student'] as Student[];
            return {
              ...db,
              id: `${db.plan_id}:${db.student_id}`,
              group: grouptable,
              student: student
            } as unknown as Placement;
          });
        }
        return []
      });
  }

  async getStudents(plan: Plan): Promise<Student[]> {
    return await supabaseClient
      .from('placement')
      .select('student(*)')
      .eq('plan_id', plan.id)
      .then(resp => {
        return resp.data?.map(data => data.student) as unknown as Student[]
      });
  }

  // getUnplacedStudents : for the Add student Modal
  async getUnplacedStudents(cohort: Cohort, plan: Plan): Promise<Student[]> {
    const enrolledStudents = await enrollmentService.getStudents(cohort);
    const placedStudents = await this.getStudents(plan);
    const placedStudentIds = new Set(placedStudents.map(student => student.id));
    const unplacedStudents = enrolledStudents.filter(student => !placedStudentIds.has(student.id));
    return unplacedStudents;
  }

  async save(placement: Placement): Promise<Placement> {
    
    const json = { ...placement }
    delete json.student;

    const updated = await this.updatePlacement(placement.plan_id,
      placement.student_id,
      json)
    updated.student = placement.student
    return updated;
  }

  async updatePlacement(planId: Identifier, studentId: Identifier, updatedFields: Partial<Placement>, select?: string): Promise<Placement> {
    const json = { ...updatedFields }
    delete json.student;

    try {
      const { data, error } = await supabaseClient.from(this.tableName)
        .update(json)
        .eq('plan_id', planId)
        .eq('student_id', studentId)
        .select(select ?? '*')
        .single();
      if (error) {
        console.error('Error updating entity:', error.message);
        throw new Error('Failed to update entity');
      }
      return data as unknown as Placement;
    } catch (err) {
      console.error('Unexpected error during update:', err);
      throw err;
    }
  }

  async deletePlacement(placement: Placement): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from(this.tableName)
        .delete()
        .eq('plan_id', placement.plan_id)
        .eq('student_id', placement.student_id);
      if (error) {
        console.error('Error deleting entity:', error.message);
        throw new Error('Failed to delete entity');
      }
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      throw err;
    }
  }

  async getEnrichedPlacements(plan: Plan): Promise<Placement[]> {
    const students = await this.getStudents(plan);
    return plan.placements.map((placement) => ({
      ...placement,
      student: students.find(
        (student) => student.id === placement.student_id
      ),
    } as Placement));
  }


  async batchInsert(entities: Placement[], select?: string): Promise<Placement[]> {
    try {
      const { data, error } = await supabaseClient
        .from(this.tableName)
        .upsert(entities)
        .select(select ?? '*');
      if (error) {
        console.error('Error inserting entity:', error);
        throw new Error('Failed to insert entity: ' + error.message);
      }
      return data as unknown as Placement[];
    } catch (err) {
      console.error('Unexpected error during insertion:', err);
      throw err;
    }
  }

  mapJson(json: any): Placement {
    const placement = {
      ...json,
      student: studentService.mapJson(json.student)
    }
    return placement;
  }

}

const placementService = new CEPlacementService('placement')
export { placementService };
