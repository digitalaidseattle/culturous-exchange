/**
 * entityService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */

import { PageInfo, QueryModel, supabaseClient } from "@digitalaidseattle/supabase";
import { Entity, Identifier } from "./types";
import { SERVICE_ERRORS } from '../constants';

abstract class EntityService<T extends Entity> {

    tableName = '';

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    supportedStringFilters(): string[] {
        return ['contains', 'startsWith', 'endsWith']
    }

    supportedNumberFilters(): string[] {
        return ['=', '>', '<']
    }

    async find(queryModel: QueryModel, select?: string): Promise<PageInfo<T>> {
        try {
            const fModel = queryModel as any;
            let query: any = supabaseClient
                .from(this.tableName)
                .select(select ?? '*', { count: 'exact' })
                .range(queryModel.page * queryModel.pageSize, (queryModel.page + 1) * queryModel.pageSize -1)
                .order(queryModel.sortField, { ascending: queryModel.sortDirection === 'asc' });
            if (fModel.filterField && fModel.filterOperator && fModel.filterValue) {
                switch (fModel.filterOperator) {
                    case '=':
                        query = query.eq(fModel.filterField, fModel.filterValue)
                        break;
                    case '>':
                        query = query.gt(fModel.filterField, fModel.filterValue)
                        break;
                    case '<':
                        query = query.lt(fModel.filterField, fModel.filterValue)
                        break;
                    case 'contains':
                        query = query.ilike(fModel.filterField, `%${fModel.filterValue}%`)
                        break;
                    case 'startsWith':
                        query = query.ilike(fModel.filterField, `${fModel.filterValue}%`)
                        break;
                    case 'endsWith':
                        query = query.ilike(fModel.filterField, `%${fModel.filterValue}`)
                        break;
                }
            }


            return query.then((resp: any) => {
                return {
                    rows: resp.data as T[],
                    totalRowCount: resp.count,
                } as PageInfo<T>;
            })
        } catch (err) {
            console.error('Unexpected error:', err);
            throw err;
        }
    }

    async getAll(select?: string): Promise<T[]> {
        return supabaseClient
            .from(this.tableName)
            .select(select ?? '*')
            .then((resp: any) => resp.data ?? [])
    }

    async getById(entityId: Identifier, select?: string): Promise<T | null> {
        try {
            return supabaseClient.from(this.tableName)
                .select(select ?? '*')
                .eq('id', entityId)
                .single()
                .then((resp: any) => resp.data ?? undefined)
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_SELECT, err);
            throw err;
        }
    }

    async batchInsert(entities: T[], select?: string): Promise<T[]> {
        try {
            const { data, error } = await supabaseClient
                .from(this.tableName)
                .upsert(entities)
                .select(select ?? '*');
            if (error) {
                console.error(SERVICE_ERRORS.ERROR_INSERTING_ENTITY, error);
                throw new Error(SERVICE_ERRORS.FAILED_INSERT_ENTITY_PREFIX + error.message);
            }
            return data as unknown as T[];
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_INSERTION, err);
            throw err;
        }
    }

    async insert(entity: T, select?: string): Promise<T> {
        try {
            const { data, error } = await supabaseClient
                .from(this.tableName)
                .upsert([entity])
                .select(select ?? '*')
                .single();
            if (error) {
                console.error(SERVICE_ERRORS.ERROR_INSERTING_ENTITY, error.message);
                throw new Error(SERVICE_ERRORS.FAILED_INSERT_ENTITY);
            }
            return data as unknown as T;
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_INSERTION, err);
            throw err;
        }
    }

    async update(entityId: Identifier, updatedFields: Partial<T>, select?: string): Promise<T> {
        try {
            const { data, error } = await supabaseClient.from(this.tableName)
                .update(updatedFields)
                .eq('id', entityId)
                .select(select ?? '*')
                .single();
            if (error) {
                console.error(SERVICE_ERRORS.ERROR_UPDATING_ENTITY, error.message);
                throw new Error(SERVICE_ERRORS.FAILED_UPDATE_ENTITY);
            }
            return data as unknown as T;
        } catch (err) {
            console.error(SERVICE_ERRORS.UNEXPECTED_ERROR_UPDATE, err);
            throw err;
        }
    }

    async delete(entityId: Identifier): Promise<void> {
        try {
            const { error } = await supabaseClient
                .from(this.tableName)
                .delete()
                .eq('id', entityId);
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

export { EntityService };
export type { Entity };

