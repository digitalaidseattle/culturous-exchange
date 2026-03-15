/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { CEStudentDao } from '../../api/ceStudentDao';
import { GENDER_OPTION, Student } from '../../api/types';
import { CETimeWindowService } from '../time/ceTimeWindowService';
import { CEProfileService } from '../ceProfileService';

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
        const { timezone, offset } = await CETimeWindowService.getInstance()
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

