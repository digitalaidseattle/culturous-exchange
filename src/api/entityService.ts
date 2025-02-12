/**
 * entityService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */

import { PageInfo, QueryModel, supabaseClient } from "@digitalaidseattle/supabase";

interface Entity {
    id: string | number;
}

abstract class EntityService<T extends Entity> {

    tableName = '';

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    async find(queryModel: QueryModel): Promise<PageInfo<T>> {
        try {
            return supabaseClient
                .from(this.tableName)
                .select('*', { count: 'exact' })
                .range(queryModel.page, queryModel.page + queryModel.pageSize)
                .order(queryModel.sortField, { ascending: queryModel.sortDirection === 'asc' })

                .then(resp => {
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

    async getById(entityId: number | undefined, select?: string): Promise<T | null> {
        try {
            return supabaseClient.from(this.tableName)
                .select(select ?? '*')
                .eq('id', entityId)
                .single()
                .then((resp: any) => resp.data ?? undefined)
        } catch (err) {
            console.error('Unexpected error during select:', err);
            throw err;
        }
    }

    async insert(entity: T, select?: string): Promise<T> {
        try {
            const { data, error } = await supabaseClient
                .from(this.tableName)
                .insert([entity])
                .select(select ?? '*')
                .single();
            if (error) {
                console.error('Error inserting entity:', error.message);
                throw new Error('Failed to insert entity');
            }
            return data as unknown as T;
        } catch (err) {
            console.error('Unexpected error during insertion:', err);
            throw err;
        }
    }

    async update(entityId: string, updatedFields: Partial<T>, select?: string): Promise<T> {
        try {
            const { data, error } = await supabaseClient.from(this.tableName)
                .update(updatedFields)
                .eq('id', entityId)
                .select(select ?? '*')
                .single();
            if (error) {
                console.error('Error updating entity:', error.message);
                throw new Error('Failed to update entity');
            }
            return data as unknown as T;
        } catch (err) {
            console.error('Unexpected error during update:', err);
            throw err;
        }
    }

    async delete(entityId: string): Promise<void> {
        try {
            const { error } = await supabaseClient
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

}

export { EntityService }
export type { Entity }
