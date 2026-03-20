/**
 *  CEPlacementDao.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

import { Identifier } from "@digitalaidseattle/core";
import { SERVICE_ERRORS } from '../constants';
import { SupabaseDao } from "./SupabaseDao";
import { CEStudentDao } from "./ceStudentDao";
import { Placement, Plan, Student } from "./types";
import { getSupabaseClient } from "./Configuration";

const DEFAULT_SELECT = '*, student(*, timewindow(*))';

export class CEPlacementDao extends SupabaseDao<Placement> {

  private static instance: CEPlacementDao;

  static getInstance() {
    if (!CEPlacementDao.instance) {
      CEPlacementDao.instance = new CEPlacementDao(getSupabaseClient(), 'placement', { select: DEFAULT_SELECT });
    }
    return CEPlacementDao.instance;
  }

  mapJson(json: any): Placement {
    const student = CEStudentDao.getInstance().mapJson(json.student);
    const mapped = {
      ...json,
      id: `${json.plan_id}:${json.student_id}`,
      student: student,
      anchor: json.anchor ?? false
    }
    return mapped;
  }

  mapEntity(entity: Partial<Placement>): any {
    const json = {
      ...entity
    }
    delete json.id;  // TODO remove when id added to table
    delete json.student;
    return json;
  }


  // TODO: add ID to placement table
  async updatePlacement(planId: Identifier, studentId: Identifier, updatedFields: Partial<Placement>): Promise<Placement> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(this.mapEntity(updatedFields))
      .eq('plan_id', planId)
      .eq('student_id', studentId)
      .select(this.getSelect())
      .single();
    if (error) {
      console.error(SERVICE_ERRORS.ERROR_UPDATING_ENTITY, error.message);
      throw new Error(SERVICE_ERRORS.FAILED_UPDATE_ENTITY);
    }
    return this.mapJson(data);
  }

  // TODO : NEW, there's something wrong with original findByPlanId need FIX.
  async findByPlan(planId: Identifier): Promise<Placement[]> {
    return await this.client
      .from(this.tableName)
      .select(this.getSelect())
      .eq('plan_id', planId)
      .then((resp: any) => resp.data.map((json: any) => this.mapJson(json)))
  }

  async findByPlanId(planId: Identifier): Promise<Placement[]> {
    return await this.client
      .from(this.tableName)
      .select('*, student(*), grouptable(*)')
      .eq('plan_id', planId)
      .then((resp: any) => resp.data.map((json: any) => this.mapJson(json)));
  }

  async getStudents(plan: Plan): Promise<Student[]> {
    return await this.client
      .from(this.tableName)
      .select('student(*)')
      .eq('plan_id', plan.id)
      .then((resp: any) => resp.data?.map((data: any) => CEStudentDao.getInstance().mapJson(data.student)));
  }

  async deletePlacement(placement: Placement): Promise<void> {
    try {
      const { error } = await this.client
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

}

