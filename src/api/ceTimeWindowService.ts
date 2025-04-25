/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { EntityService } from "./entityService";
import { Student, TimeWindow } from "./types";
import { addHours, isEqual } from "date-fns";

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
                    { day_in_week: 'Friday', start_t: '07:00:00', end_t: '12:00:00' },
                    { day_in_week: 'Friday', start_t: '12:00:00', end_t: '17:00:00' },
                    { day_in_week: 'Friday', start_t: '17:00:00', end_t: '22:00:00' },
                    { day_in_week: 'Saturday', start_t: '07:00:00', end_t: '12:00:00' },
                    { day_in_week: 'Saturday', start_t: '12:00:00', end_t: '17:00:00' },
                    { day_in_week: 'Saturday', start_t: '17:00:00', end_t: '22:00:00' },
                    { day_in_week: 'Sunday', start_t: '07:00:00', end_t: '12:00:00' },
                    { day_in_week: 'Sunday', start_t: '12:00:00', end_t: '17:00:00' },
                    { day_in_week: 'Sunday', start_t: '17:00:00', end_t: '22:00:00' }
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

    toDateTime(day: number, time: string, offset: number): Date {
        const sTimes = time
            .split(':')
            .map((s) => Number.parseInt(s));
        const dateTime = new Date(0, 1, day, sTimes[0], sTimes[1], sTimes[2])
        addHours(dateTime, offset);
        return dateTime;
    }

    adjustTimeWindows(student: Student, offset: number) {
        if (student.timeWindows) {
            student.timeWindows
                .forEach(timeWindow => {
                    const day = timeWindow.day_in_week === 'Friday' ? 1
                        : timeWindow.day_in_week === 'Saturday' ? 2 : 3;
                    timeWindow.start_date_time = this.toDateTime(day, timeWindow.start_t, offset);
                    timeWindow.end_date_time = this.toDateTime(day, timeWindow.end_t, offset);
                });
        }
    }

    async getForStudent(student: Student): Promise<TimeWindow[]> {
        return supabaseClient
            .from(this.tableName)
            .select('*')
            .eq('student_id', student.id)
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
}

const timeWindowService = new CETimeWindowService('timewindow')
export { timeWindowService };
