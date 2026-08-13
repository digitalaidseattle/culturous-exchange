/**
 *  ProfileUploader.test.ts
 *
 *  CEMT-151: insert_from_excel used to fire one unbounded Promise.all inserting
 *  every parsed row concurrently, which fanned out into thousands of simultaneous
 *  DB requests for large spreadsheets. It should instead write in bounded batches
 *  and report progress after each batch.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";

import { CEProfile } from "../../api/types";
import { CEProfileService } from "../ceProfileService";
import { ValidationService } from "../ValidationService";
import { PROFILE_UPLOAD_BATCH_SIZE } from "../../constants";
import { ProfileUploader } from "./ProfileUploader";

// Minimal concrete subclass for testing: createProfile is a passthrough, and
// get_profiles_from_excel is overridden to skip real xlsx parsing entirely so
// these tests only exercise insert_from_excel's batching/progress behavior.
class TestUploader extends ProfileUploader<CEProfile> {
    constructor(
        validationService: ValidationService<CEProfile>,
        profileService: CEProfileService<CEProfile>,
        private canned: CEProfile[]
    ) {
        super(validationService, profileService);
    }
    createProfile(dict: any): CEProfile {
        return dict as CEProfile;
    }
    async get_profiles_from_excel(_file: File): Promise<CEProfile[]> {
        return this.canned;
    }
}

function makeProfiles(n: number): CEProfile[] {
    return Array.from({ length: n }, (_, i) =>
        ({ id: `p${i}`, name: `Profile ${i}`, email: `p${i}@test.com`, city: "City", country: "Country" } as CEProfile));
}

const passingValidation = { validate: vi.fn(() => []) } as unknown as ValidationService<CEProfile>;

describe("ProfileUploader.insert_from_excel batching (CEMT-151)", () => {

    it("never has more than PROFILE_UPLOAD_BATCH_SIZE saves in flight at once", async () => {
        const profiles = makeProfiles(PROFILE_UPLOAD_BATCH_SIZE * 3 + 4);
        let inFlight = 0;
        let maxInFlight = 0;
        const save = vi.fn(async (p: CEProfile) => {
            inFlight++;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await new Promise(resolve => setTimeout(resolve, 0));
            inFlight--;
            return p;
        });
        const profileService = { save } as unknown as CEProfileService<CEProfile>;
        const uploader = new TestUploader(passingValidation, profileService, profiles);

        const result = await uploader.insert_from_excel({} as File);

        expect(result.successCount).toBe(profiles.length);
        expect(maxInFlight).toBeGreaterThan(1); // still concurrent within a batch
        expect(maxInFlight).toBeLessThanOrEqual(PROFILE_UPLOAD_BATCH_SIZE);
    });

    it("reports cumulative progress after each batch completes", async () => {
        const profiles = makeProfiles(PROFILE_UPLOAD_BATCH_SIZE + 5);
        const profileService = { save: vi.fn(async (p: CEProfile) => p) } as unknown as CEProfileService<CEProfile>;
        const uploader = new TestUploader(passingValidation, profileService, profiles);

        const progressCalls: [number, number][] = [];
        await uploader.insert_from_excel({} as File, (completed, total) => progressCalls.push([completed, total]));

        expect(progressCalls).toEqual([
            [PROFILE_UPLOAD_BATCH_SIZE, profiles.length],
            [profiles.length, profiles.length],
        ]);
    });

    it("propagates the original parse error message instead of a generic one", async () => {
        const save = vi.fn();
        const profileService = { save } as unknown as CEProfileService<CEProfile>;
        const uploader = new TestUploader(passingValidation, profileService, []);
        vi.spyOn(uploader, "get_profiles_from_excel").mockRejectedValue(new Error("Failed to parse Excel file"));

        await expect(uploader.insert_from_excel({} as File)).rejects.toThrow("Failed to parse Excel file");
        expect(save).not.toHaveBeenCalled();
    });

});
