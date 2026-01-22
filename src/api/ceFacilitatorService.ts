/**
 * ceFacilitatorService.ts
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { PageInfo, QueryModel, supabaseClient } from '@digitalaidseattle/supabase';
import { v4 as uuid } from 'uuid';
import { timeWindowService } from './ceTimeWindowService';
import { EntityService } from "./entityService";
import { Cohort, Facilitator, Identifier } from "./types";

const DEFAULT_SELECT = '*, timewindow(*)';

export class MockFilitatorService {


  empty(): Facilitator {
    return {
      id: uuid(),
      name: '',
      email: '',
      city: '',
      country: '',
      time_zone: '',
      tz_offset: 0,
      timeWindows: []
    };
  }

  async save(facilitator: Facilitator): Promise<Facilitator> {
    console.log(facilitator);
    throw new Error('Method not implemented.');
  }

  async find(queryModel: QueryModel, select?: string): Promise<PageInfo<Facilitator>> {
    console.log(queryModel, select);
    const testData = [
      {
        id: 'ABC',
        name: 'Bill',
        email: 'bill@das.org',
        city: 'Los Angeles',
        country: 'USA',
        time_zone: 'LA',
        tz_offset: -7,
        timeWindows: []
      },
    ] as Facilitator[];
    return Promise.resolve({ rows: testData, totalRowCount: testData.length });
  }

  supportedStringFilters(): string[] {
    return ['contains', 'startsWith', 'endsWith']
  }

  supportedNumberFilters(): string[] {
    return ['=', '>', '<']
  }

  getCohorts(updated: Facilitator): Promise<Cohort[]> {
    console.log(updated);
    return Promise.resolve([]);
  }

  async delete(entityId: Identifier): Promise<void> {
    console.log(entityId);
    throw new Error('Method not implemented.');
  }

}

class CEFacilitatorService extends EntityService<Facilitator> {

  static _instance: CEFacilitatorService;

  static getInstance(): CEFacilitatorService {
    if (!this._instance) {
      this._instance = new CEFacilitatorService('facilitator');
    }
    return this._instance;
  }

  empty(): Facilitator {
    return {
      id: uuid(),
      name: '',
      email: '',
      city: '',
      country: '',
      time_zone: '',
      tz_offset: 0,
      timeWindows: []
    };
  }

  async find(queryModel: QueryModel, select?: string): Promise<PageInfo<Facilitator>> {
    return super
      .find(queryModel, select ?? DEFAULT_SELECT)
      .then((pageInfo) => {
        const updatedRows = pageInfo.rows.map((student: any) => this.mapJson(student))
        return { rows: updatedRows, totalRowCount: pageInfo.totalRowCount }
      })
  }

  async update(entityId: Identifier, updatedFields: Partial<Facilitator>, select?: string): Promise<Facilitator> {
    const json = { ...updatedFields } as any;
    delete json.timeWindows;

    return super.update(entityId, json, select)
      .then(updated => this.mapJson(updated)!);
  }

  mapJson(json: any): Facilitator {
    const facilitator = {
      ...json,
      timeWindows: json.timewindow.map((js: any) => timeWindowService.mapJson(js))
    }
    delete facilitator.timewindow
    return facilitator
  }

  async save(student: Facilitator): Promise<Facilitator> {
    // inserting group before tw is required.  Group must exist before timewindow added.
    const json = { ...student }
    delete json.timeWindows;

    await this.insert(json);

    // FIXME
    // await timeWindowService.deleteByFacilitatorId(student.id);
    for (const tw of student.timeWindows!) {
      await timeWindowService.save(tw)
    }
    // TODO get fresh instance?
    return student
  }

  async getAll(select?: string): Promise<Facilitator[]> {
    return supabaseClient
      .from(this.tableName)
      .select(select ?? DEFAULT_SELECT)
      .then((resp: any) => {
        const json = resp.data ?? [];
        return json.map((jFacilitator: any) => this.mapJson(jFacilitator));
      })
  }

  getCohorts(updated: Facilitator): Promise<Cohort[]> {
    console.log(updated);
    throw new Error('Method not implemented.');
  }
}

export { CEFacilitatorService };
