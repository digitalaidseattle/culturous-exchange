/**
 *  ceProfileService.test.ts
 *
 *  Regression coverage for CEMT-132: uploaded time windows were saved without an
 *  owner id, so the deep join keyed on student_id could never load them back, and
 *  the UI showed "not assigned". CEProfileService.save must stamp the saved
 *  profile's id onto every time window before insert.
 *
 *  Also covers CEMT-137: CEStudentService.save must forward the student's
 *  state to the timezone lookup so repeated city names resolve correctly.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Facilitator, Student, TimeWindow } from "../api/types";
import { CEStudentService } from "./student/CEStudentService";
import { CEFacilitatorService } from "./facilitator/CEFacilitatorService";

// Spies are declared via vi.hoisted so they exist when the vi.mock factories run.
const { batchInsertSpy, adjustSpy, deleteByStudentIdSpy, studentDaoDeleteSpy, getTimeZoneSpy } = vi.hoisted(() => ({
    batchInsertSpy: vi.fn(),
    adjustSpy: vi.fn(),
    deleteByStudentIdSpy: vi.fn(async () => true),
    studentDaoDeleteSpy: vi.fn(async () => undefined),
    getTimeZoneSpy: vi.fn(async () => ({ timezone: "America/Los_Angeles", offset: -8 }))
}));

// Stub the time-window DAO so getInstance does not need a configured Supabase
// client, and so we can inspect exactly what gets inserted.
vi.mock("../api/ceTimeWindowDao", () => ({
    CETimeWindowDao: {
        getInstance: () => ({ batchInsert: batchInsertSpy, deleteByStudentId: deleteByStudentIdSpy })
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
            getById: vi.fn(async (id: any) => ({ id })),
            delete: studentDaoDeleteSpy
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
// The spy is hoisted so tests can assert on the arguments it receives.
vi.mock("./time/ceTimeZoneService", () => ({
    CETimeZoneService: {
        getInstance: () => ({
            getTimeZone: getTimeZoneSpy
        })
    }
}));

describe("CEProfileService.save owner stamping (CEMT-132)", () => {

    beforeEach(() => {
        batchInsertSpy.mockClear();
        adjustSpy.mockClear();
        deleteByStudentIdSpy.mockClear();
        studentDaoDeleteSpy.mockClear();
        getTimeZoneSpy.mockClear();
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

describe("CEStudentService.save timezone lookup (CEMT-137)", () => {

    beforeEach(() => {
        getTimeZoneSpy.mockClear();
    });

    it("passes city, country, and state to the timezone lookup", async () => {
        const student = {
            id: "student-2",
            name: "Test Student",
            city: "Portland",
            state: "OR",
            country: "United States",
            timeWindows: []
        } as unknown as Student;

        await CEStudentService.getInstance().save(student);

        expect(getTimeZoneSpy).toHaveBeenCalledTimes(1);
        expect(getTimeZoneSpy).toHaveBeenCalledWith("Portland", "United States", "OR");
    });

    it("passes an undefined state through unchanged", async () => {
        const student = {
            id: "student-3",
            name: "Test Student",
            city: "Cairo",
            country: "Egypt",
            timeWindows: []
        } as unknown as Student;

        await CEStudentService.getInstance().save(student);

        expect(getTimeZoneSpy).toHaveBeenCalledWith("Cairo", "Egypt", undefined);
    });

});

describe("CEStudentService.delete (student delete cleanup)", () => {

    beforeEach(() => {
        deleteByStudentIdSpy.mockClear();
        studentDaoDeleteSpy.mockClear();
    });

    it("deletes the student's time windows before the student row", async () => {
        await CEStudentService.getInstance().delete("student-1");

        expect(deleteByStudentIdSpy).toHaveBeenCalledTimes(1);
        expect(deleteByStudentIdSpy).toHaveBeenCalledWith("student-1");
        expect(studentDaoDeleteSpy).toHaveBeenCalledTimes(1);
        expect(studentDaoDeleteSpy).toHaveBeenCalledWith("student-1");

        // Order matters: timewindow.student_id has no ON DELETE rule, so the
        // windows must be gone before the student row is deleted.
        expect(deleteByStudentIdSpy.mock.invocationCallOrder[0])
            .toBeLessThan(studentDaoDeleteSpy.mock.invocationCallOrder[0]);
    });

});
