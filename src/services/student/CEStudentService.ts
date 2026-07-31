/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { Identifier } from '@digitalaidseattle/core';
import { CEStudentDao } from '../../api/ceStudentDao';
import { CETimeWindowDao } from '../../api/ceTimeWindowDao';
import { GENDER_OPTION, Student, TimeWindow } from '../../api/types';
import { CEProfileService } from '../ceProfileService';
import { CETimeZoneService } from '../time/ceTimeZoneService';

class CEStudentService extends CEProfileService<Student> {

    private static instance: CEStudentService;

    static getInstance(): CEStudentService {
        if (!this.instance) {
            this.instance = new CEStudentService()
        }
        return this.instance;
    }

    timezoneService: CETimeZoneService;
    constructor() {
        super(CEStudentDao.getInstance());
        this.timezoneService = CETimeZoneService.getInstance();
    }

    empty(): Student {
        return {
            id: uuid(),
            name: '',
            email: '',
            city: '',
            country: '',
            age: 15,
            time_zone: '',
            tz_offset: 0,
            anchor: false,
            gender: GENDER_OPTION[0],
            timeWindows: []
        } as Student;
    }

    assignOwner(timeWindow: TimeWindow, ownerId: Identifier): TimeWindow {
        timeWindow.student_id = ownerId;
        return timeWindow;
    }

    // Delete a student and their time windows.
    // The windows must be deleted first: timewindow.student_id has no
    // ON DELETE rule, so the database blocks deleting a student that
    // still has windows pointing at it. Mirrors the child-rows-first
    // pattern used by planDelete and ceGroupService.deleteGroup.
    async delete(studentId: Identifier): Promise<void> {
        const timeWindowDao = CETimeWindowDao.getInstance();
        await timeWindowDao.deleteByStudentId(studentId);
        await this.profileDao.delete(studentId);
    }

    async save(profile: Student): Promise<Student> {
        const { timezone, offset } = await this.timezoneService.getTimeZone(profile.city!, profile.country)
        const updated = {
            ...profile,
            time_zone: timezone,
            tz_offset: offset
        }
        return super.save(updated);
    }

}


export { CEStudentService };
