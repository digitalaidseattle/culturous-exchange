/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';
import { Identifier } from '@digitalaidseattle/core';
import { CEProfile, TimeWindow } from '../api/types';
import { SupabaseDao } from '../api/SupabaseDao';
import { CETimeWindowDao } from '../api/ceTimeWindowDao';
import { CETimeWindowService } from './time/ceTimeWindowService';



class CEProfileService<T extends CEProfile> {

    profileDao: SupabaseDao<T>;

    constructor(profileDao: SupabaseDao<T>) {
        this.profileDao = profileDao;
    }

    empty(): T {
        throw new Error('Subclass should implement.')
    };

    // Stamp the owning profile's id onto a time window before it is persisted.
    // Students set student_id; facilitators set facilitator_id.
    // Subclasses implement this so a window is never saved without an owner.
    assignOwner(_timeWindow: TimeWindow, _ownerId: Identifier): TimeWindow {
        throw new Error('Subclass should implement.');
    }

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
            .map(tw => this.assignOwner({ ...tw, id: uuid() } as TimeWindow, inserted.id!));

        await timeWindowDao.batchInsert(timeWindows);

        return this.profileDao.getById(inserted.id!)
            .then(found => found!)
            .catch(error => { throw error })
    }

}

export { CEProfileService };
