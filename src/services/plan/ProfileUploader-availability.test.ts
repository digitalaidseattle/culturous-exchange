/**
 *  ProfileUploader-availability.test.ts
 *
 *  CEMT-129: the availability column must be found whether the spreadsheet
 *  header says "based on your time zone" (corrected wording) or
 *  "based in your time zone" (older exports, including the sample files).
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";

import { CEProfile } from "../../api/types";
import { CEProfileService } from "../ceProfileService";
import { ValidationService } from "../ValidationService";
import { ProfileUploader } from "./ProfileUploader";

class TestUploader extends ProfileUploader<CEProfile> {
    constructor() {
        super({} as ValidationService<CEProfile>, {} as CEProfileService<CEProfile>);
    }

    createProfile(dict: any): CEProfile {
        return { timeWindows: this.timeWindowService.mapTimeWindows(this.findAvailability(dict).split(',')) } as CEProfile;
    }
}

describe("ProfileUploader availability header (CEMT-129)", () => {
    const uploader = new TestUploader();
    const times = "Friday morning (7am-12pm), Sunday evening (5pm-10pm)";

    // Headers exactly as they appear in a spreadsheet, before changeToLowercase.
    const correctedHeader = "Please mark all times that would be possible for the Online Group Session on the weekend (based on your time zone)";
    const originalHeader = "Please mark all times that would be possible for the Online Group Session on the weekend (based in your time zone)                 ";

    it("finds the column with the corrected 'based on' wording", () => {
        const dict = uploader.changeToLowercase({ [correctedHeader]: times });
        expect(uploader.findAvailability(dict)).toBe(times);
    });

    it("still finds the column with the original 'based in' wording", () => {
        const dict = uploader.changeToLowercase({ [originalHeader]: times });
        expect(uploader.findAvailability(dict)).toBe(times);
    });

    it("prefers the corrected wording when both columns are present", () => {
        const dict = uploader.changeToLowercase({ [originalHeader]: "old", [correctedHeader]: "new" });
        expect(uploader.findAvailability(dict)).toBe("new");
    });

    it("returns undefined when the column is missing", () => {
        const dict = uploader.changeToLowercase({ "Email Address": "a@b.org" });
        expect(uploader.findAvailability(dict)).toBeUndefined();
    });

    it("produces time windows from either wording", () => {
        [correctedHeader, originalHeader].forEach(header => {
            const profile = uploader.createProfile(uploader.changeToLowercase({ [header]: times }));
            expect(profile.timeWindows).toEqual([
                { day_in_week: 'Friday', start_t: '07:00:00', end_t: '12:00:00' },
                { day_in_week: 'Sunday', start_t: '17:00:00', end_t: '22:00:00' }
            ]);
        });
    });
});
