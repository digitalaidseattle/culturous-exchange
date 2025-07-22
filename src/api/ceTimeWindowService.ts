/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { addHours, format, isEqual } from "date-fns";
import { EntityService } from "./entityService";
import { Identifier, Student, TimeWindow } from "./types";

function areStringArraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

// function areTimeWindowsOverlapping(timeWindowsA: TimeWindow, timeWindowsB: TimeWindow): boolean {
//     return (isAfter(timeWindowsA.start_date_time!, timeWindowsB.start_date_time!) && isBefore(timeWindowsA.start_date_time!, timeWindowsB.end_date_time!)) ||
//         (isAfter(timeWindowsB.start_date_time!, timeWindowsA.start_date_time!) && isBefore(timeWindowsB.start_date_time!, timeWindowsA.end_date_time!));
// }

class CETimeWindowService extends EntityService<TimeWindow> {

  intersectionTimeWindows(timeWindowsA: TimeWindow, timeWindowsB: TimeWindow): TimeWindow | null {
    const timeArray = [
      { name: 'AS', date: timeWindowsA.start_date_time! },
      { name: 'AE', date: timeWindowsA.end_date_time! },
      { name: 'BS', date: timeWindowsB.start_date_time! },
      { name: 'BE', date: timeWindowsB.end_date_time! }
    ]
    const sortedTimeArray = timeArray.sort((a, b) => a.date.getTime() - b.date.getTime()).map((t) => t.name);
    if (areStringArraysEqual(sortedTimeArray, ['AS', 'AE', 'BS', 'BE'])) {
      return null;
    } else if (areStringArraysEqual(sortedTimeArray, ['AS', 'BS', 'AE', 'BE'])) {
      if (!isEqual(timeWindowsB.start_date_time!, timeWindowsA.end_date_time!)) {
        return {
          day_in_week: timeWindowsA.day_in_week,
          start_date_time: timeWindowsB.start_date_time,
          end_date_time: timeWindowsA.end_date_time
        } as TimeWindow;
      }
    } else if (areStringArraysEqual(sortedTimeArray, ['AS', 'BS', 'BE', 'AE'])) {
      if (!isEqual(timeWindowsB.start_date_time!, timeWindowsB.end_date_time!)) {
        return {
          day_in_week: timeWindowsA.day_in_week,
          start_date_time: timeWindowsB.start_date_time,
          end_date_time: timeWindowsB.end_date_time
        } as TimeWindow;
      }
    } else if (areStringArraysEqual(sortedTimeArray, ['BS', 'AS', 'BE', 'AE'])) {
      if (!isEqual(timeWindowsA.start_date_time!, timeWindowsB.end_date_time!)) {
        return {
          day_in_week: timeWindowsA.day_in_week,
          start_date_time: timeWindowsA.start_date_time,
          end_date_time: timeWindowsB.end_date_time
        } as TimeWindow;
      }
    } else if (areStringArraysEqual(sortedTimeArray, ['BS', 'AS', 'AE', 'BE'])) {
      if (!isEqual(timeWindowsA.start_date_time!, timeWindowsA.end_date_time!)) {
        return {
          day_in_week: timeWindowsA.day_in_week,
          start_date_time: timeWindowsA.start_date_time,
          end_date_time: timeWindowsA.end_date_time
        } as TimeWindow;
      }
    } else if (areStringArraysEqual(sortedTimeArray, ['BS', 'BE', 'AS', 'AE'])) {
      return null;
    } else {
      console.error('Unexpected time window intersection:', timeWindowsA, timeWindowsB, sortedTimeArray);
      return null;
    }
    return null
  }

  intersectionTimeWindowsMultiple(timeWindowsA: TimeWindow[], timeWindowsB: TimeWindow[]): TimeWindow[] {
    // This function computes all pairwise intersections between the TimeWindow[] arrays timeWindowsA and timeWindowsB

    const intersect: TimeWindow[] = [];
    timeWindowsA.forEach(twA => {
      timeWindowsB.forEach(twB => {

        const intersection = this.intersectionTimeWindows(twA, twB);
        if (intersection) {
          intersect.push(intersection);
        }
      });
    });
    return intersect;
  }

  mapTimeWindows(entries: string[]): Partial<TimeWindow>[] {
    let timeWindows: Partial<TimeWindow>[] = [];
    entries.forEach(entry => {
      timeWindows = timeWindows.concat(this.createTimeWindows(entry))
    });
    return timeWindows;
  }

  createTimeWindows(entry: string): Partial<TimeWindow>[] {
    switch (entry.trim()) {
      case "All options work for me":
        return [
          { day_in_week: 'Friday', start_t: '07:00:00', end_t: '22:00:00' },
          { day_in_week: 'Saturday', start_t: '07:00:00', end_t: '22:00:00' },
          { day_in_week: 'Sunday', start_t: '07:00:00', end_t: '22:00:00' },
        ];
      case "Friday morning (7am-12pm)":
        return [{ day_in_week: 'Friday', start_t: '07:00:00', end_t: '12:00:00' }];
      case "Friday afternoon (12pm-5 pm)":
        return [{ day_in_week: 'Friday', start_t: '12:00:00', end_t: '17:00:00' }];
      case "Friday evening (5pm-10pm)":
        return [{ day_in_week: 'Friday', start_t: '17:00:00', end_t: '22:00:00' }];
      case "Saturday morning (7am-12pm)":
        return [{ day_in_week: 'Saturday', start_t: '07:00:00', end_t: '12:00:00' }];
      case "Saturday afternoon (12pm-5pm)":
        return [{ day_in_week: 'Saturday', start_t: '12:00:00', end_t: '17:00:00' }];
      case "Saturday evening (5pm-10pm)":
        return [{ day_in_week: 'Saturday', start_t: '17:00:00', end_t: '22:00:00' }];
      case "Sunday morning (7am-12pm)":
        return [{ day_in_week: 'Sunday', start_t: '07:00:00', end_t: '12:00:00' }];
      case "Sunday afternoon (12pm-5pm)":
        return [{ day_in_week: 'Sunday', start_t: '12:00:00', end_t: '17:00:00' }];
      case "Sunday evening (5pm-10pm)":
        return [{ day_in_week: 'Sunday', start_t: '17:00:00', end_t: '22:00:00' }];
      default:
        return [];
    }
  }

  // dayOffset is 0 for Friday, 1 for Saturday, and 2 for Sunday
  toDateTime(dayOffset: number, time: string, offset: number): Date {
    const sTimes = time
      .split(':')
      .map((s) => Number.parseInt(s));
    const dateTime = new Date(2000, 8, dayOffset + 1, sTimes[0], sTimes[1], sTimes[2])
    return addHours(dateTime, offset);
  }

  toTimeWindowDate(dateTime: Date, offset: number): { day: number, time: string } {
    const local = addHours(dateTime, -offset);
    const day = local.getDay();
    const time = local.toTimeString().split(' ')[0]; // Get time in HH:MM:SS format
    return { day: day, time: time };
  }

  adjustTimeWindows(student: Student) {
    if (student.timeWindows) {
      student.timeWindows
        .forEach(timeWindow => {
          const dayOffset = timeWindow.day_in_week === 'Friday' ? 0
            : timeWindow.day_in_week === 'Saturday' ? 1 : 2;
          timeWindow.start_date_time = this.toDateTime(dayOffset, timeWindow.start_t, student.tz_offset);
          timeWindow.end_date_time = this.toDateTime(dayOffset, timeWindow.end_t, student.tz_offset);
        });
    }
  }

  async findByGroupId(groupId: Identifier, select?: string): Promise<TimeWindow[]> {
    return await supabaseClient
      .from(this.tableName)
      .select(select ?? '*')
      .eq('group_id', groupId)
      .then(resp => resp.data as unknown as TimeWindow[]);
  }

  async getTimeZone(city: string, country: string): Promise<{ timezone: string, offset: number }> {
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

  toString(tw: TimeWindow, offset?: number): string {
    let start_time = offset ? addHours(tw.start_date_time!, -offset) : tw.start_date_time!;
    let end_time = offset ? addHours(tw.end_date_time!, -offset) : tw.end_date_time!;
    return `${tw.day_in_week} ${format(start_time, "haaa")} - ${format(end_time, "haaa")}`
  }

  async overlapDuration(timeWindows: TimeWindow[]): Promise<number> {
    // get the total overlapping hours
    return timeWindows.reduce((acc, tw) => acc +
      ((tw.end_date_time?.getTime() ?? 0) - (tw.start_date_time?.getTime() ?? 0)) / (1000 * 60 * 60), 0);
  }



}

const timeWindowService = new CETimeWindowService('timewindow')
export { timeWindowService };
