/**
 *  CETimeSlotService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { CEStudentDao } from "../../api/ceStudentDao";

function normalize(value: string | undefined | null): string {
  return (value ?? '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export class CETimeZoneService {
  private static _instance: CETimeZoneService;

  static getInstance(): CETimeZoneService {
    if (!this._instance) {
      this._instance = new CETimeZoneService();
    }
    return this._instance;
  }

  cache: Map<string, { timezone: string, offset: number }> = new Map();

  private pending: Map<string, Promise<{ timezone: string, offset: number }>> = new Map();

  private constructor() {
    this.loadExisting()
      .then(() => this.cache)

  }

  cacheKey(city: string, country: string, state?: string): string {
    return `${normalize(city)}@${normalize(state)}@${normalize(country)}`;
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
    const resp = await fetch(`https://api.ipgeolocation.io/timezone?apiKey=${import.meta.env.VITE_IPGEOLOCATION_KEY}&location=${location}`);

    if (!resp.ok) {
      // ipgeolocation.io has no per-second/per-minute rate limit (confirmed in
      // their docs) - a 429 here means the daily request quota is exhausted,
      // which won't clear up on retry, only after the quota resets.
      const reason = resp.status === 429 ? 'daily API quota likely exhausted' : `HTTP ${resp.status}`;
      throw new Error(`Failed to fetch timezone city: ${city}, state: ${trimmedState}, country: ${country} (${reason})`);
    }
    const data = await resp.json();
    return {
      timezone: data.timezone,
      offset: data.timezone_offset
    }
  }

  async getTimeZone(city: string, country: string, state?: string): Promise<{ timezone: string, offset: number }> {
    const key = this.cacheKey(city, country, state);
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const inFlight = this.pending.get(key);
    if (inFlight) {
      return inFlight;
    }

    // No per-second rate limit on this API (confirmed in their docs), so
    // lookups can fire directly - concurrency is naturally bounded by
    // PROFILE_UPLOAD_BATCH_SIZE upstream in ProfileUploader.
    const lookup = this.lookupTimeZone(city, country, state)
      .then(result => {
        this.cache.set(key, result);
        return result;
      })
      .finally(() => {
        this.pending.delete(key);
      });

    this.pending.set(key, lookup);
    return lookup;
  }
}
