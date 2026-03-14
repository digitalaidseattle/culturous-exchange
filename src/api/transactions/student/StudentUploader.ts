/**
 * StudentUploader.ts
 *
 * encapsulate excel interaction
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { ProfileUploader } from '../plan/ProfileUploader';
import { Student } from '../../types';
import { StudentValidationService } from '../../ValidationService';
import { CEStudentService } from './CEStudentService';


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
        return {
            ...this.profileService.empty(),
            name: dict['first/given name in english'].trim() + ' ' + dict['last/sur/family name in english'].trim(),
            age: Number.parseInt(dict['your age (how old are you currently)']),
            email: dict['email address'],
            city: dict['home city (and state if applicable)'],
            country: dict['home country:'].trim(),
            gender: dict['gender'].trim(),
            timeWindows: this.timeWindowService.mapTimeWindows(times.split(',')),
            anchor: dict['anchor/priority'] ? dict['anchor/priority'].toLowerCase().trim() === 'x' : false,
        } as Student
    }
}
