/**
 *  ceCohortService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { supabaseClient } from "@digitalaidseattle/supabase";
import { EntityService } from "./entityService";
import { Student, TimeWindow } from "./types";
import { addHours } from "date-fns";


class CETimeWindowService extends EntityService<TimeWindow> {


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

