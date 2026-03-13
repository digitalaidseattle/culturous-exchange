/**
 *  addFacilitator.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { v4 as uuid } from 'uuid';

import { CEFacilitatorDao } from "../../ceFacilitatorDao";
import { CETimeWindowService } from "../../ceTimeWindowService";
import { Facilitator } from "../../types";

export async function saveFacilitator(facilitator: Facilitator): Promise<Facilitator> {
    const timeWindowService = CETimeWindowService.getInstance();
    const facilitatorDao = CEFacilitatorDao.getInstance();

    timeWindowService.adjustTimeWindows(facilitator);

    const now = new Date();
    const json = {
        ...facilitator,
        created_at: facilitator.created_at ?? now,
        updated_at: now
    }
    delete json.timeWindows;
    const inserted = await facilitatorDao.upsert(json)

    const timeWindows = (facilitator.timeWindows ?? [])
        .map(tw => ({
            ...tw,
            id: uuid()
        }));

    await timeWindowService.batchInsert(timeWindows);

    return facilitatorDao.getById(inserted.id!)
        .then(found => found!)
        .catch(error => { throw error })
}
