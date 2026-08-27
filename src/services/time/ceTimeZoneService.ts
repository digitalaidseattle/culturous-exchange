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

  // Cache key format: `${city}@${state}@${country}`, with state empty
  // when absent. State disambiguates repeated city names
  // (Portland, OR vs Portland, ME). CEMT-137.
  cacheKey(city: string, country: string, state?: string): string {
    return `${city}@${(state ?? '').trim()}@${country}`;
  }

  async loadExisting(): Promise<void> {
    CEStudentDao.getInstance()
      .getAll()
      .then(students =>
        students.forEach(student => {
          const key = this.cacheKey(student.city, student.country, student.state);
          const value = { timezone: student.time_zone!, offset: student.tz_offset };
          this.cache.set(key, value);
        })
      );
  }

  async lookupTimeZone(city: string, country: string, state?: string): Promise<{ timezone: string, offset: number }> {
    const trimmedState = (state ?? '').trim();
    const location = trimmedState
      ? `${city},%20${trimmedState},%20${country}`
      : `${city},%20${country}`;
    return fetch(`https://api.ipgeolocation.io/timezone?apiKey=${import.meta.env.VITE_IPGEOLOCATION_KEY}&location=${location}`)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(`Failed to fetch timezone city: ${city}, state: ${trimmedState}, country: ${country}`);
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

  // state is optional and last to keep existing two-argument callers working.
  async getTimeZone(city: string, country: string, state?: string): Promise<{ timezone: string, offset: number }> {
    const key = this.cacheKey(city, country, state);
    const value = this.cache.get(key);

    if (value) {
      return value;
    }
    return value ?? this.lookupTimeZone(city, country, state)
      .then(lookup => {
        this.cache.set(key, lookup);
        return lookup;
      })
  }
}
