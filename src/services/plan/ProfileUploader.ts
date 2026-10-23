/**
 * StudentUploader.ts
 *
 * encapsulate excel interaction
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { read, utils } from "xlsx";

import { CEProfile, FailedProfile } from "../../api/types";
import { ValidationService } from "../ValidationService";
import { CEProfileService } from "../ceProfileService";
import { CETimeWindowService } from "../time/ceTimeWindowService";
import { PROFILE_UPLOAD_BATCH_SIZE, SERVICE_ERRORS } from "../../constants";

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

    async insert_from_excel(
        excel_file: File,
        onProgress?: (completed: number, total: number) => void
    ): Promise<{ successCount: number; successProfiles: T[]; failedProfiles: FailedProfile[] }> {
        // Let a parse failure propagate with its own specific message (thrown by
        // get_profiles_from_excel) instead of being masked by the generic message below.
        const profiles = await this.get_profiles_from_excel(excel_file);

        try {
            // Insert in bounded batches instead of firing every row's request at once -
            // an unbounded Promise.all over thousands of rows fans out into thousands of
            // simultaneous DB round trips, which is what causes large uploads to hang (CEMT-151).
            const resps: { success: boolean; profile: CEProfile | FailedProfile }[] = [];
            for (let i = 0; i < profiles.length; i += PROFILE_UPLOAD_BATCH_SIZE) {
                const batch = profiles.slice(i, i + PROFILE_UPLOAD_BATCH_SIZE);
                const batchResps = await Promise.all(batch.map(profile => this.insertProfile(profile as T)));
                resps.push(...batchResps);
                onProgress?.(resps.length, profiles.length);
            }

            const successful = resps.filter(resp => resp.success);
            const failed = resps.filter(resp => !resp.success);
            return {
                successCount: successful.length,
                // CEMT-138: expose the created profiles so callers (e.g. cohort upload) can enroll them
                successProfiles: successful.map(resp => resp.profile as T),
                failedProfiles: failed.map(resp => resp.profile as FailedProfile),
            }
        } catch (error) {
            console.error(SERVICE_ERRORS.ERROR_PROCESSING_EXCEL_FILE, error);
            throw new Error(SERVICE_ERRORS.FAILED_INSERT_STUDENTS_FROM_EXCEL_FILE);
        }
    }

}

export { ProfileUploader };
