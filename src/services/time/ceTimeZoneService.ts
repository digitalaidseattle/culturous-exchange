/**
 *  CETimeSlotService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { CEStudentDao } from "../../api/ceStudentDao";


export class CETimeZoneService {
  private static _instance: CETimeZoneService;

  static getInstance(): CETimeZoneService {
    if (!this._instance) {
      this._instance = new CETimeZoneService();
    }
    return this._instance;
  }

  //  TODO: move this cache into persistence
  cache: Map<string, { timezone: string, offset: number }> = new Map();

  private constructor() {
    this.loadExisting()
      .then(() => this.cache)

  }

  async loadExisting(): Promise<void> {
    CEStudentDao.getInstance()
      .getAll()
      .then(students =>
        students.forEach(student => {
          const key = `${student.city}@${student.country}`;
          const value = { timezone: student.time_zone!, offset: student.tz_offset };
          this.cache.set(key, value);
        })
      );
  }

  async lookupTimeZone(city: string, country: string): Promise<{ timezone: string, offset: number }> {
    // return {
    //   timezone: 'America/Los_Angeles',
    //   offset: -8
    // };
    return fetch(`https://api.ipgeolocation.io/timezone?apiKey=${import.meta.env.VITE_IPGEOLOCATION_KEY}&location=${city},%20${country}`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(`Failed to fetch timezone city: ${city}, country: ${country}`);
        }
        return resp.json()
      })
      .then(data => {
        return {
          timezone: data.timezone,
          offset: data.timezone_offset
        }
      })
  }

  async getTimeZone(city: string, country: string): Promise<{ timezone: string, offset: number }> {
    const key = `${city}@${country}`;
    const value = this.cache.get(key);

    if (value) {
      return value;
    }
    return value ?? this.lookupTimeZone(city, country)
      .then(lookup => {
        this.cache.set(key, lookup);
        return lookup;
      })
  }
}
