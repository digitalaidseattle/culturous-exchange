/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { EntityService } from "@digitalaidseattle/core";
import { CETimeWindowService } from "./ceTimeWindowService";
import { CEProfile } from "./types";


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

export { CEProfileService };
