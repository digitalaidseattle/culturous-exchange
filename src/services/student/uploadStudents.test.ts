/**
 *  uploadStudents.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FailedProfile, Student } from "../../api/types";
import { StudentUploader } from "./StudentUploader";
import { uploadStudents } from "./uploadStudents";

vi.mock("./StudentUploader", () => ({ StudentUploader: { getInstance: vi.fn() } }));

const student = (id: string) => ({ id, name: id }) as Student;
const failed = (name: string) => ({ name }) as FailedProfile;

describe("uploadStudents", () => {
    const insert_from_excel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (StudentUploader.getInstance as ReturnType<typeof vi.fn>).mockReturnValue({ insert_from_excel });
    });

    it("says which students were added and which rows failed, across all the files", async () => {
        insert_from_excel
            .mockResolvedValueOnce({ successProfiles: [student("s1")], failedProfiles: [failed("A")] })
            .mockResolvedValueOnce({ successProfiles: [student("s2"), student("s3")], failedProfiles: [] });
        const files = [{} as File, {} as File];

        const result = await uploadStudents(files);

        expect(insert_from_excel).toHaveBeenCalledTimes(2);
        expect(result.students.map(s => s.id)).toEqual(["s1", "s2", "s3"]);
        expect(result.failedProfiles.map(p => p.name)).toEqual(["A"]);
    });

    it("passes on an error from reading a file", async () => {
        insert_from_excel.mockRejectedValue(new Error("Failed to parse"));
        await expect(uploadStudents([{} as File])).rejects.toThrow("Failed to parse");
    });
});
