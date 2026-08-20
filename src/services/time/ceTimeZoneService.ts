/**
 *  CETimeSlotService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { CEStudentDao } from "../../api/ceStudentDao";

// Trim, lowercase, and strip diacritics so "Kabul"/"kabul "/"Peru"/"Perú" all
// hit the same cache entry instead of missing on cosmetic differences in
// free-text spreadsheet data.
function normalize(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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

  // Lookups in flight, keyed the same as the cache - lets concurrent calls for
  // the same city/country share one request instead of each firing its own.
  private pending: Map<string, Promise<{ timezone: string, offset: number }>> = new Map();

  // Counters for verifying how much load actually reaches the external API
  // vs. being absorbed by the cache - handy when testing a new API key or
  // diagnosing quota issues.
  private stats = { cacheHits: 0, apiCalls: 0 };

  getStats() {
    return { ...this.stats };
  }

  private constructor() {
    this.loadExisting()
      .then(() => this.cache)

  }

  async loadExisting(): Promise<void> {
    CEStudentDao.getInstance()
      .getAll()
      .then(students =>
        students.forEach(student => {
          const key = `${normalize(student.city)}@${normalize(student.country)}`;
          const value = { timezone: student.time_zone!, offset: student.tz_offset };
          this.cache.set(key, value);
        })
      );
  }

  async lookupTimeZone(city: string, country: string): Promise<{ timezone: string, offset: number }> {
    this.stats.apiCalls++;
    const resp = await fetch(`https://api.ipgeolocation.io/timezone?apiKey=${import.meta.env.VITE_IPGEOLOCATION_KEY}&location=${city},%20${country}`);

    if (!resp.ok) {
      // ipgeolocation.io has no per-second/per-minute rate limit (confirmed in
      // their docs) - a 429 here means the daily request quota is exhausted,
      // which won't clear up on retry, only after the quota resets.
      const reason = resp.status === 429 ? 'daily API quota likely exhausted' : `HTTP ${resp.status}`;
      throw new Error(`Failed to fetch timezone city: ${city}, country: ${country} (${reason})`);
    }
    const data = await resp.json();
    return {
      timezone: data.timezone,
      offset: data.timezone_offset
    }
  }

  async getTimeZone(city: string, country: string): Promise<{ timezone: string, offset: number }> {
    const key = `${normalize(city)}@${normalize(country)}`;
    const cached = this.cache.get(key);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    const inFlight = this.pending.get(key);
    if (inFlight) {
      return inFlight;
    }

    // No per-second rate limit on this API (confirmed in their docs), so
    // lookups can fire directly - concurrency is naturally bounded by
    // PROFILE_UPLOAD_BATCH_SIZE upstream in ProfileUploader.
    const lookup = this.lookupTimeZone(city, country)
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
