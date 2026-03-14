/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { Entity, Identifier } from "@digitalaidseattle/core";
import { supabaseClient, SupabaseEntityService } from "@digitalaidseattle/supabase";
import { SERVICE_ERRORS } from '../constants';

export abstract class SupabaseDao<T extends Entity> extends SupabaseEntityService<T> {

  mapJson(json: any): T {
    return { ...json };
  }

  mapEntity(entity: Partial<T>): any {
    return { ...entity };
  }

  getSelect(select?: string): string {
    return select ?? '*';
  }

  async insert(entity: T, select?: string): Promise<T> {
    const json = this.mapEntity(entity);
    return super.insert(json, this.getSelect(select))
      .then((resp: any) => this.mapJson(resp))
      .catch(err => {
        console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
        throw err;
      });
  }

  async update(entityId: Identifier, updatedFields: Partial<T>, select?: string): Promise<T> {
    const json = this.mapEntity(updatedFields);
    return super.update(entityId, json, this.getSelect(select))
      .then(updated => this.mapJson(updated)!);
  }

  async upsert(entity: T): Promise<T> {
    try {
      const json = this.mapEntity(entity);
      const { data, error } = await supabaseClient
        .from(this.tableName)
        .upsert([json])
        .select(this.select)
        .single()
      if (error) {
        console.error('Failed to upsert entity', error);
        throw new Error('Failed to upsert entity');
      }
      return this.mapJson(data);
    } catch (err) {
      console.error('Error inserting entity:', err);
      throw err;
    }
  }
}

