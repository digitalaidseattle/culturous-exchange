/**
 * StudentUploader.ts
 *
 * encapsulate excel interaction
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { Student } from '../../api/types';
import { ProfileUploader } from '../plan/ProfileUploader';
import { StudentValidationService } from '../ValidationService';
import { CEStudentService } from './CEStudentService';

/**
 * Resolve city and state from a spreadsheet row.
 *
 * A dedicated 'state' column wins when present. Until the intake form
 * adds one, students type combined answers into the city question
 * ("Home City (and State if applicable)"), so we fall back to splitting
 * that answer on commas: the first segment is the city, the last segment
 * is the state, and middle segments are dropped.
 *
 * This rule is based on the Winter Program 2025 sample responses, e.g.
 *   "São Paulo, SP"                                       -> city + state code
 *   "Tanta, Al Gharbia"                                   -> city + governorate
 *   "São João de Meriti, Baixada Fluminense, Rio de Janeiro"
 *                                                         -> city + ... + state
 * If updated sample data shows new formats, revisit this function and
 * its tests (StudentUploader.test.ts).
 */
export function parseLocation(rawCity?: string, rawState?: string): { city: string, state: string } {
    const city = (rawCity ?? '').trim();
    let state = (rawState ?? '').trim();

    const segments = city
        .split(',')
        .map(segment => segment.trim())
        .filter(segment => segment.length > 0);

    if (segments.length >= 2) {
        if (!state) {
            state = segments[segments.length - 1];
        }
        return { city: segments[0], state };
    }

    return { city: segments[0] ?? '', state };
}

export class StudentUploader extends ProfileUploader<Student> {
    private static instance: StudentUploader;
    static getInstance() {
        if (!StudentUploader.instance) {
            StudentUploader.instance = new StudentUploader();
        }
        return StudentUploader.instance;
    }
    constructor() {
        super(StudentValidationService.getInstance(), CEStudentService.getInstance());
    }
    createProfile(dict: any): Student {
        const times = dict['please mark all times that would be possible for the online group session on the weekend (based in your time zone)'];
        const location = parseLocation(
            dict['home city (and state if applicable)'],
            dict['state']
        );
        return {
            ...this.profileService.empty(),
            name: dict['first/given name in english'].trim() + ' ' + dict['last/sur/family name in english'].trim(),
            age: Number.parseInt(dict['your age (how old are you currently)']),
            email: dict['email address'],
            city: location.city,
            state: location.state,
            country: dict['home country:'].trim(),
            gender: dict['gender'].trim(),
            timeWindows: this.timeWindowService.mapTimeWindows(times.split(',')),
            anchor: dict['anchor/priority'] ? dict['anchor/priority'].toLowerCase().trim() === 'x' : false,
        } as Student
    }
}
