/**
 *  CEProfileService.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { v4 as uuid } from 'uuid';

import { CEProfileService } from '../../ceProfileService';
import { Facilitator } from '../../types';
import { CEFacilitatorDao } from '../../ceFacilitatorDao';

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



export { CEFacilitatorService };

