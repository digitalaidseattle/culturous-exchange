/**
 * StudentUploader.ts
 *
 * encapsulate excel interaction
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { ProfileUploader } from '../plan/ProfileUploader';
import { Facilitator } from '../../types';
import { FacilitatorValidationService } from '../../ValidationService';
import { CEFacilitatorService } from './CEFacilitatorService';

export class FacilitatorUploader extends ProfileUploader<Facilitator> {
    private static instance: FacilitatorUploader;

    static getInstance() {
        if (!FacilitatorUploader.instance) {
            FacilitatorUploader.instance = new FacilitatorUploader();
        }
        return FacilitatorUploader.instance;
    }

    constructor() {
        super(FacilitatorValidationService.getInstance(), CEFacilitatorService.getInstance());
    }

    createProfile(dict: any): Facilitator {
        const times = dict['please mark all times that would be possible for the online group session on the weekend (based in your time zone)'];
        return {
            ...this.profileService.empty(),
            name: dict['first/given name in english'].trim() + ' ' + dict['last/sur/family name in english'].trim(),
            email: dict['email address'],
            city: dict['home city (and state if applicable)'],
            country: dict['home country:'].trim(),
            timeWindows: this.timeWindowService.mapTimeWindows(times.split(',')),
        } as Facilitator
    }
}
