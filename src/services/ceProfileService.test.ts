/**
 *  ceProfileService.test.ts
 *
 *  Regression coverage for CEMT-132: uploaded time windows were saved without an
 *  owner id, so the deep join keyed on student_id could never load them back, and
 *  the UI showed "not assigned". CEProfileService.save must stamp the saved
 *  profile's id onto every time window before insert.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Facilitator, Student, TimeWindow } from "../api/types";
import { CEStudentService } from "./student/CEStudentService";
import { CEFacilitatorService } from "./facilitator/CEFacilitatorService";

// Spies are declared via vi.hoisted so they exist when the vi.mock factories run.
const { batchInsertSpy, adjustSpy } = vi.hoisted(() => ({
    batchInsertSpy: vi.fn(),
    adjustSpy: vi.fn()
}));

// Stub the time-window DAO so getInstance does not need a configured Supabase
// client, and so we can inspect exactly what gets inserted.
vi.mock("../api/ceTimeWindowDao", () => ({
    CETimeWindowDao: {
        getInstance: () => ({ batchInsert: batchInsertSpy })
    }
}));

// adjustTimeWindows is irrelevant to this assertion; stub it out.
vi.mock("./time/ceTimeWindowService", () => ({
    CETimeWindowService: {
        getInstance: () => ({ adjustTimeWindows: adjustSpy })
    }
}));

// Stub the profile DAOs. upsert echoes the profile so inserted.id === profile.id.
vi.mock("../api/ceStudentDao", () => ({
    CEStudentDao: {
        getInstance: () => ({
            upsert: vi.fn(async (profile: any) => ({ ...profile })),
            getById: vi.fn(async (id: any) => ({ id }))
        })
    }
}));

vi.mock("../api/ceFacilitatorDao", () => ({
    CEFacilitatorDao: {
        getInstance: () => ({
            upsert: vi.fn(async (profile: any) => ({ ...profile })),
            getById: vi.fn(async (id: any) => ({ id }))
        })
    }
}));

// Stub the timezone lookup so the student save does not hit the network.
vi.mock("./time/ceTimeZoneService", () => ({
    CETimeZoneService: {
        getInstance: () => ({
            getTimeZone: vi.fn(async () => ({ timezone: "America/Los_Angeles", offset: -8 }))
        })
    }
}));

describe("CEProfileService.save owner stamping (CEMT-132)", () => {

    beforeEach(() => {
        batchInsertSpy.mockClear();
        adjustSpy.mockClear();
    });

    it("stamps student_id on every time window it saves", async () => {
        const student = {
            id: "student-1",
            name: "Test Student",
            city: "Manila",
            country: "Philippines",
            timeWindows: [
                { day_in_week: "Friday", start_t: "07:00:00", end_t: "12:00:00" } as TimeWindow,
                { day_in_week: "Saturday", start_t: "12:00:00", end_t: "17:00:00" } as TimeWindow
            ]
        } as Student;

        await CEStudentService.getInstance().save(student);

        expect(batchInsertSpy).toHaveBeenCalledTimes(1);
        const inserted = batchInsertSpy.mock.calls[0][0] as TimeWindow[];
        expect(inserted).toHaveLength(2);
        inserted.forEach(tw => expect(tw.student_id).toBe("student-1"));
    });

    it("stamps facilitator_id on every time window it saves", async () => {
        const facilitator = {
            id: "facilitator-1",
            name: "Test Facilitator",
            timeWindows: [
                { day_in_week: "Sunday", start_t: "17:00:00", end_t: "22:00:00" } as TimeWindow
            ]
        } as Facilitator;

        await CEFacilitatorService.getInstance().save(facilitator);

        expect(batchInsertSpy).toHaveBeenCalledTimes(1);
        const inserted = batchInsertSpy.mock.calls[0][0] as TimeWindow[];
        expect(inserted).toHaveLength(1);
        expect(inserted[0].facilitator_id).toBe("facilitator-1");
    });

});
