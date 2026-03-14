/**
 * StudentUploader.ts
 *
 * encapsulate excel interaction
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { read, utils } from "xlsx";
import { SERVICE_ERRORS } from '../../../constants';
import { CEProfileService } from '../../ceProfileService';
import { CETimeWindowService } from "../../ceTimeWindowService";
import { CEProfile, FailedProfile } from "../../types";
import { ValidationService } from '../../ValidationService';

abstract class ProfileUploader<T extends CEProfile> {
    validationService: ValidationService<T>;
    profileService: CEProfileService<T>;
    timeWindowService;

    constructor(validationService: ValidationService<T>, profileService: CEProfileService<T>) {
        this.validationService = validationService;
        this.profileService = profileService;
        this.timeWindowService = CETimeWindowService.getInstance();
    }

    changeToLowercase(object: any): any {
        const lowered: { [key: string]: any } = {};
        Object.keys(object).forEach(key => {
            lowered[key.toLowerCase().trim()] = object[key];
        })

        return lowered;
    }

    abstract createProfile(dict: any): CEProfile;

    async get_profiles_from_excel(excel_file: File): Promise<CEProfile[]> {
        try {
            const arrayBuffer = await excel_file.arrayBuffer();
            const workbook = read(arrayBuffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data: any[] = utils.sheet_to_json(worksheet);

            // Modify data if necessary (e.g., ensure id is generated if not provided)
            return data
                .map(dict => this.changeToLowercase(dict))
                .map((dict) => this.createProfile(dict));
        } catch (error) {
            console.error(SERVICE_ERRORS.ERROR_PARSING_EXCEL_FILE, error);
            throw new Error(SERVICE_ERRORS.FAILED_PARSE_EXCEL_FILE);
        }
    }

    async insertProfile(profile: T): Promise<{ success: boolean; profile: CEProfile | FailedProfile }> {
        const errors = this.validationService.validate(profile);
        if (errors && Object.keys(errors).length > 0) {
            console.error(`Spreadsheet validation failed for profile ${profile}: `, errors)
            //FIX ME: failedError: errors is not recievable as an array on the front end notification system. The front-end is currently set up to display a single error string for each failed student.
            return { success: false, profile: { ...profile, failedError: errors } };
        }
        return this.profileService.save(profile)
            .then(inserted => {
                return { success: true, profile: inserted };
            })
            .catch((err) => {
                console.error(`Student ${profile.name} could not be inserted`);
                return { success: false, profile: { ...profile, failedError: err.message } };
            });

    }

    async insert_from_excel(excel_file: File): Promise<{ successCount: number; failedProfiles: FailedProfile[] }> {
        try {
            return this.get_profiles_from_excel(excel_file)
                .then(async profiles => {
                    return Promise
                        .all(profiles.map(profile => this.insertProfile(profile as T)))
                        .then((resps) => {
                            const successful = resps.filter(resp => resp.success);
                            const failed = resps.filter(resp => !resp.success);
                            return {
                                successCount: successful.length,
                                failedProfiles: failed.map(resp => resp.profile as FailedProfile),
                            }
                        })
                })
        } catch (error) {
            console.error(SERVICE_ERRORS.ERROR_PROCESSING_EXCEL_FILE, error);
            throw new Error(SERVICE_ERRORS.FAILED_INSERT_STUDENTS_FROM_EXCEL_FILE);
        }
    }

}

export { ProfileUploader };
