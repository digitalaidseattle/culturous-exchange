/**
 *  CETimeSlotService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { TimeSlot, TimeWindow } from "./types";


export const TIME_SLOTS: TimeSlot[] = [
  { label: "Friday morning (7am-12pm)", day_in_week: "Friday", start_t: "07:00:00", end_t: "12:00:00" },
  { label: "Friday afternoon (12pm-5pm)", day_in_week: "Friday", start_t: "12:00:00", end_t: "17:00:00" },
  { label: "Friday evening (5pm-10pm)", day_in_week: "Friday", start_t: "17:00:00", end_t: "22:00:00" },
  { label: "Saturday morning (7am-12pm)", day_in_week: "Saturday", start_t: "07:00:00", end_t: "12:00:00" },
  { label: "Saturday afternoon (12pm-5pm)", day_in_week: "Saturday", start_t: "12:00:00", end_t: "17:00:00" },
  { label: "Saturday evening (5pm-10pm)", day_in_week: "Saturday", start_t: "17:00:00", end_t: "22:00:00" },
  { label: "Sunday morning (7am-12pm)", day_in_week: "Sunday", start_t: "07:00:00", end_t: "12:00:00" },
  { label: "Sunday afternoon (12pm-5pm)", day_in_week: "Sunday", start_t: "12:00:00", end_t: "17:00:00" },
  { label: "Sunday evening (5pm-10pm)", day_in_week: "Sunday", start_t: "17:00:00", end_t: "22:00:00" },
]

class CETimeSlotService {
  private static _instance: CETimeSlotService;

  static getInstance(): CETimeSlotService {
    if (!this._instance) {
      this._instance = new CETimeSlotService();
    }
    return this._instance;
  }

  private constructor() {
  }

  findTimeSlot(timeWindow: TimeWindow): TimeSlot | null {
    return TIME_SLOTS.find(slot =>
      slot.day_in_week === timeWindow.day_in_week &&
      slot.start_t === timeWindow.start_t &&
      slot.end_t === timeWindow.end_t) || null;
  }

  isTimeWindowEqual(timeWindow: TimeWindow, ts: TimeSlot): boolean {
    return ts.day_in_week === timeWindow.day_in_week &&
      ts.start_t === timeWindow.start_t &&
      ts.end_t === timeWindow.end_t;
  }
}

export { CETimeSlotService };
