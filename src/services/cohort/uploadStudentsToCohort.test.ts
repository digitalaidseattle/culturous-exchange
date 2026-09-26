/**
 *  uploadStudentsToCohort.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Cohort, FailedProfile, Student } from "../../api/types";
import { StudentUploader } from "../student/StudentUploader";
import { addStudentsToCohort } from "./addStudentsToCohort";
import { uploadStudentsToCohort } from "./uploadStudentsToCohort";

vi.mock("../student/StudentUploader", () => {
    return {
        StudentUploader: {
            getInstance: vi.fn(),
        },
    };
});

vi.mock("./addStudentsToCohort", () => {
    return {
        addStudentsToCohort: vi.fn(),
    };
});

describe("uploadStudentsToCohort", () => {
    const getInstanceMock = StudentUploader.getInstance as ReturnType<typeof vi.fn>;
    const addStudentsMock = addStudentsToCohort as ReturnType<typeof vi.fn>;

    const cohort = { id: "cohort1", name: "Test Cohort" } as Cohort;

    // Configure StudentUploader.insert_from_excel to resolve the given
    // result(s), one per uploaded file, in order.
    function mockUpload(...results: any[]) {
        const insert_from_excel = vi.fn();
        results.forEach(r => insert_from_excel.mockResolvedValueOnce(r));
        getInstanceMock.mockReturnValue({ insert_from_excel });
        return insert_from_excel;
    }

    beforeEach(() => {
        vi.clearAllMocks();
        addStudentsMock.mockResolvedValue(true);
    });

    it("enrolls every created student into the cohort", async () => {
        const s1 = { id: "s1", name: "Maria" } as Student;
        const s2 = { id: "s2", name: "Carlos" } as Student;
        mockUpload({ successCount: 2, successProfiles: [s1, s2], failedProfiles: [] });

        const result = await uploadStudentsToCohort(cohort, [{} as File]);

        // created students are enrolled in one call
        expect(addStudentsMock).toHaveBeenCalledTimes(1);
        expect(addStudentsMock).toHaveBeenCalledWith(cohort, [s1, s2]);

        expect(result.successCount).toBe(2);
        expect(result.failedCount).toBe(0);
        expect(result.attemptedCount).toBe(2);
        expect(result.failedProfiles).toEqual([]);
    });

    it("does not enroll when no students were created", async () => {
        const f1 = { name: "Bad1", failedError: "invalid" } as unknown as FailedProfile;
        const f2 = { name: "Bad2", failedError: "invalid" } as unknown as FailedProfile;
        mockUpload({ successCount: 0, successProfiles: [], failedProfiles: [f1, f2] });

        const result = await uploadStudentsToCohort(cohort, [{} as File]);

        // a fully failed upload must not trigger an empty enrollment call
        expect(addStudentsMock).not.toHaveBeenCalled();

        expect(result.successCount).toBe(0);
        expect(result.failedCount).toBe(2);
        expect(result.attemptedCount).toBe(2);
        expect(result.failedProfiles.length).toBe(2);
    });

    it("aggregates created and failed students across multiple files", async () => {
        const s1 = { id: "s1", name: "Maria" } as Student;
        const s2 = { id: "s2", name: "Carlos" } as Student;
        const f1 = { name: "Bad", failedError: "invalid" } as unknown as FailedProfile;
        mockUpload(
            { successCount: 1, successProfiles: [s1], failedProfiles: [f1] },
            { successCount: 1, successProfiles: [s2], failedProfiles: [] },
        );

        const result = await uploadStudentsToCohort(cohort, [{} as File, {} as File]);

        // students from both files are enrolled together in a single call
        expect(addStudentsMock).toHaveBeenCalledTimes(1);
        expect(addStudentsMock).toHaveBeenCalledWith(cohort, [s1, s2]);

        expect(result.successCount).toBe(2);
        expect(result.failedCount).toBe(1);
        expect(result.attemptedCount).toBe(3);
        expect(result.failedProfiles.length).toBe(1);
    });
});
