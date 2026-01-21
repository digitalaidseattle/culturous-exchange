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
import { SERVICE_ERRORS } from '../constants';


class CEPlacementService {
  tableName = '';

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  mapJson(json: any): Placement {
    return {
      ...json,
      student: studentService.mapJson(json.student)
    }
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
        console.error(SERVICE_ERRORS.ERROR_UPDATING_ENTITY, error.message);
        throw new Error(SERVICE_ERRORS.FAILED_UPDATE_ENTITY);
      }
      return data as unknown as Placement;
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_UPDATE, err);
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
        console.error(SERVICE_ERRORS.ERROR_DELETING_ENTITY, error.message);
        throw new Error(SERVICE_ERRORS.FAILED_DELETE_ENTITY);
      }
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_DELETION, err);
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
      const json = entities.map(entity => {
        const js = { ...entity }
        delete js.student
        return js
      })
      const { data, error } = await supabaseClient
        .from(this.tableName)
        .upsert(json)
        .select(select ?? '*');
      if (error) {
        console.error(SERVICE_ERRORS.ERROR_INSERTING_ENTITY, error);
        throw new Error(SERVICE_ERRORS.FAILED_INSERT_ENTITY_PREFIX + error.message);
      }
      return data as unknown as Placement[];
    } catch (err) {
      console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_INSERTION, err);
      throw err;
    }
  }

}

const placementService = new CEPlacementService('placement')
export { placementService };
