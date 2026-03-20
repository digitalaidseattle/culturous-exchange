/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { CEStudentDao } from '../../api/ceStudentDao';
import { GENDER_OPTION, Student } from '../../api/types';
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

