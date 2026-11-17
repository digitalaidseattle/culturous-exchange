/**
 *  createCohort.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Cohort, Student } from "../../api/types";
import { createCohort } from "./createCohort";

const insert = vi.hoisted(() => vi.fn());
const findUnenrolled = vi.hoisted(() => vi.fn());
const addStudentsToCohort = vi.hoisted(() => vi.fn());

vi.mock("../../api/ceCohortDao", () => ({ CECohortDao: { getInstance: () => ({ insert }) } }));
vi.mock("../../api/ceStudentDao", () => ({ CEStudentDao: { getInstance: () => ({ findUnenrolled }) } }));
vi.mock("./addStudentsToCohort", () => ({ addStudentsToCohort }));

const student = (id: string) => ({ id, name: id }) as Student;

describe("createCohort", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        insert.mockImplementation(async (cohort: Cohort) => cohort);
        addStudentsToCohort.mockResolvedValue([]);
    });

    it("names the cohort as asked, without the spaces around the name", async () => {
        const cohort = await createCohort({ name: "  Winter 2027  ", students: [] });
        expect(cohort.name).toBe("Winter 2027");
        expect(insert).toHaveBeenCalledWith(expect.objectContaining({ name: "Winter 2027" }));
    });

    it("enrols the students it is given, and no others", async () => {
        const students = [student("s1"), student("s2")];
        const cohort = await createCohort({ name: "Winter 2027", students });
        expect(addStudentsToCohort).toHaveBeenCalledWith(cohort, students);
        expect(findUnenrolled).not.toHaveBeenCalled();
    });

    it("with no students given, enrols the students who are not in a cohort yet", async () => {
        const waiting = [student("s3")];
        findUnenrolled.mockResolvedValue(waiting);
        const cohort = await createCohort({ name: "Winter 2027" });
        expect(addStudentsToCohort).toHaveBeenCalledWith(cohort, waiting);
    });

    it("with no name, is called (New) Cohort, as before", async () => {
        findUnenrolled.mockResolvedValue([]);
        expect((await createCohort()).name).toBe("(New) Cohort");
        expect((await createCohort({ name: "   ", students: [] })).name).toBe("(New) Cohort");
    });

    it("does not enrol anyone when there is no one to enrol", async () => {
        await createCohort({ name: "Empty", students: [] });
        expect(addStudentsToCohort).not.toHaveBeenCalled();
    });
});
