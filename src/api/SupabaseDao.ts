/**
 *  cePlanService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { SupabaseClient } from "@supabase/supabase-js";


import { Entity, Identifier } from "@digitalaidseattle/core";
import { PageInfo, QueryModel, supabaseClient } from "@digitalaidseattle/supabase";

export type DataAccessOptions = {
  count?: number;
  select?: string;
}

export abstract class SupabaseDao<T extends Entity> {
  client: SupabaseClient;
  tableName = '';
  select = '*';

  constructor(supabaseClient: SupabaseClient, tableName: string, opts?: DataAccessOptions) {
    this.client = supabaseClient;
    this.tableName = tableName;
    this.select = opts ? opts.select ?? "*" : "*";
  }


  // MUI datagrid filters
  supportedStringFilters(): string[] {
    return ['contains', 'startsWith', 'endsWith', 'equals', 'doesNotEqual']
  }

  supportedNumberFilters(): string[] {
    return ['=', '>', '<', '!=']
  }

  mapJson(json: any): T {
    return { ...json };
  }

  mapEntity(entity: Partial<T>): any {
    return { ...entity };
  }

  getSelect(opts?: DataAccessOptions): string {
    return opts ? opts.select ?? this.select : this.select;
  }

  async find(queryModel: QueryModel, opts?: DataAccessOptions): Promise<PageInfo<T>> {
    try {

      let query: any = supabaseClient
        .from(this.tableName)
        .select(this.getSelect(opts), { count: 'exact' })
        .range(queryModel.page * queryModel.pageSize, (queryModel.page + 1) * queryModel.pageSize - 1)

      // add sorting
      let sortField = queryModel.sortField
      const sortOperator = { ascending: queryModel.sortDirection === 'asc' } as any
      if (sortField.includes('.')) {
        const split = sortField.split('.');
        sortField = `${split[0]}(${split[1]})`;
      }
      query.order(sortField, sortOperator);

      // add filtering
      const filterModel = queryModel.filterModel;
      if (filterModel && filterModel.items) {
        filterModel.items.forEach((filter: any) => {
          const field = filter.field;
          const operator = filter.operator;
          const value = filter.value;
          if (field && operator && value) {
            switch (operator) {
              case '=':
              case 'equals':
                query = query.eq(field, value)
                break;
              case '!=':
              case 'doesNotEqual':
                query = query.neq(field, value)
                break;
              case '>':
                query = query.gt(field, value)
                break;
              case '<':
                query = query.lt(field, value)
                break;
              case 'contains':
                query = query.ilike(field, `%${value}%`)
                break;
              case 'startsWith':
                query = query.ilike(field, `${value}%`)
                break;
              case 'endsWith':
                query = query.ilike(field, `%${value}`)
                break;
            }
          }
        })
      }

      return query.then((resp: any) => {
        return {
          rows: resp.data.map((json: any) => this.mapJson(json)),
          totalRowCount: resp.count,
        };
      })
    } catch (err) {
      console.error('Unexpected error:', err);
      throw err;
    }
  }

  async getAll(opts?: DataAccessOptions): Promise<T[]> {
    const count = opts ? opts.count : undefined;

    let query = this.client
      .from(this.tableName)
      .select(this.getSelect(opts));
    if (count) {
      query = query.limit(count)
    }
    return query.then((resp: any) =>
      (resp.data ?? []).map((json: any) => this.mapJson(json))
    )
  }

  async getById(entityId: Identifier, opts?: DataAccessOptions): Promise<T> {
    try {
      const select = this.getSelect(opts!);

      const { data, error } = await this.client.from(this.tableName)
        .select(select)
        .eq('id', entityId)
        .single();
      if (error) {
        console.error('Unexpected error during select', error);
        throw new Error('Unexpected error during select');
      }
      return this.mapJson(data);
    } catch (err) {
      console.error('Unexpected error during select:', err);
      throw err;
    }
  }

  async insert(entity: T, opts?: DataAccessOptions): Promise<T> {
    try {
      const json = this.mapEntity(entity);
      const select = this.getSelect(opts!);
console.log(select)
      return await this.client
        .from(this.tableName)
        .insert([json])
        .select(select)
        .single()
        .then((resp: any) => this.mapJson(resp.data))
    } catch (err) {
      console.error('Unexpected error during insertion:', err);
      throw err;
    }
  }
  async batchInsert(entities: T[], opts?: DataAccessOptions): Promise<T[]> {
    try {
      const toInsert = entities.map(ent => this.mapEntity(ent));
      const select = this.getSelect(opts!);

      return await this.client
        .from(this.tableName)
        .insert(toInsert)
        .select(select)
        .then((resp: any) => (resp.data ?? []).map((json: any) => this.mapJson(json)))
    } catch (err) {
      console.error('Unexpected error during insertion:', err);
      throw err;
    }
  }

  async update(entityId: Identifier, updatedFields: Partial<T>, opts?: DataAccessOptions): Promise<T> {
    try {
      const json = this.mapEntity(updatedFields);
      const select = this.getSelect(opts!);

      const { data, error } = await this.client
        .from(this.tableName)
        .update(json)
        .eq('id', entityId)
        .select(select)
        .single();
      if (error) {
        console.error('Failed to update entity', error);
        throw new Error('Failed to update entity');
      }
      return this.mapJson(data);
    } catch (err) {
      console.error('Unexpected error during update:', err);
      throw err;
    }
  }

  async delete(entityId: Identifier): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', entityId);
      if (error) {
        console.error('Error deleting entity:', error.message);
        throw new Error('Failed to delete entity');
      }
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      throw err;
    }
  }

  async upsert(entity: T, opts?: DataAccessOptions): Promise<T> {
    try {
      const json = this.mapEntity(entity);
      const select = this.getSelect(opts);

      const { data, error } = await supabaseClient
        .from(this.tableName)
        .upsert([json])
        .select(select)
        .single()
      if (error) {
        console.error('Failed to upsert entity', error);
        throw new Error('Failed to upsert entity');
      }
      return this.mapJson(data);
    } catch (err) {
      console.error('Error upsert entity:', err);
      throw err;
    }
  }
}

