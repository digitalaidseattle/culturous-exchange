/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { CEProfileService } from '../../ceProfileService';
import { CEStudentDao } from '../../ceStudentDao';
import { GENDER_OPTION, Student } from '../../types';

class CEStudentService extends CEProfileService<Student> {

    private static instance: CEStudentService;

    static getInstance(): CEStudentService {
        if (!this.instance) {
            this.instance = new CEStudentService()
        }
        return this.instance;
    }

    constructor() {
        super(CEStudentDao.getInstance());
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
        const { timezone, offset } = await this.timeWindowService
            .getTimeZone(profile.city!, profile.country)
        const updated = {
            ...profile,
            timezone: timezone,
            offset: offset
        }
        return super.save(updated);
    }

}


export { CEStudentService };

