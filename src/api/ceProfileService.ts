/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { EntityService } from "@digitalaidseattle/core";
import { CEFacilitatorDao } from './ceFacilitatorDao';
import { CETimeWindowService } from "./ceTimeWindowService";
import { CEProfile, Facilitator, Student } from "./types";
import { CEStudentDao } from './ceStudentDao';
import { GENDER_OPTION } from '../constants';


class CEProfileService<T extends CEProfile> {

    timeWindowService: CETimeWindowService;
    profileDao: EntityService<T>;

    constructor(profileDao: EntityService<T>) {
        this.timeWindowService = CETimeWindowService.getInstance();
        this.profileDao = profileDao;
    }

    empty(): T {
        throw new Error('Subclass should implement.')
    };

    async save(profile: T): Promise<T> {
        this.timeWindowService.adjustTimeWindows(profile);

        const now = new Date();
        const json = {
            ...profile,
            created_at: profile.created_at ?? now,
            updated_at: now
        }
        delete json.timeWindows;
        const inserted = await this.profileDao.upsert(json)

        const timeWindows = (profile.timeWindows ?? [])
            .map(tw => ({
                ...tw,
                id: uuid()
            }));

        await this.timeWindowService.batchInsert(timeWindows);

        return this.profileDao.getById(inserted.id!)
            .then(found => found!)
            .catch(error => { throw error })
    }

}

class CEFacilitatorService extends CEProfileService<Facilitator> {

    private static instance: CEFacilitatorService;

    static getInstance(): CEFacilitatorService {
        if (!this.instance) {
            this.instance = new CEFacilitatorService()
        }
        return this.instance;
    }

    constructor() {
        super(CEFacilitatorDao.getInstance());
    }

    empty(): Facilitator {
        return {
            id: uuid(),
            name: '',
            email: '',
            time_zone: '',
            tz_offset: 0,
            bio: '',
            city: '',
            country: '',
            avatar_url: undefined,
            active: true,
            timeWindows: []
        } as Facilitator;
    }

}

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



export { CEFacilitatorService, CEProfileService, CEStudentService };
