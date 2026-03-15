/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { CEProfile } from '../api/types';
import { SupabaseDao } from '../api/SupabaseDao';
import { CETimeWindowDao } from '../api/ceTimeWindowDao';
import { CETimeWindowService } from '../api/ceTimeWindowService';



class CEProfileService<T extends CEProfile> {

    profileDao: SupabaseDao<T>;

    constructor(profileDao: SupabaseDao<T>) {
        this.profileDao = profileDao;
    }

    empty(): T {
        throw new Error('Subclass should implement.')
    };

    async save(profile: T): Promise<T> {
        const timeWindowDao = CETimeWindowDao.getInstance();
        const timeWindowService = CETimeWindowService.getInstance();
        timeWindowService.adjustTimeWindows(profile);

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

        await timeWindowDao.batchInsert(timeWindows);

        return this.profileDao.getById(inserted.id!)
            .then(found => found!)
            .catch(error => { throw error })
    }

}

export { CEProfileService };
