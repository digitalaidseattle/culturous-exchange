/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { planGenerator } from "./planGenerator";
import { Group } from "./types";

describe("planGenerator", () => {

    it("createTimewindows", () => {

        const group = {
            id: "test"
        } as Group;

        planGenerator.createTimewindows(group)
            .then(result => {
                expect(result.length).toBe(3);
                expect(result[0].start_date_time.toISOString()).toBe("2000-09-01T22:00:00.000Z");
                expect(result[0].end_date_time.toISOString()).toBe("2000-09-02T13:00:00.000Z");
                expect(result[1].start_date_time.toISOString()).toBe("2000-09-02T22:00:00.000Z");
                expect(result[1].end_date_time.toISOString()).toBe("2000-09-03T13:00:00.000Z");
                expect(result[2].start_date_time.toISOString()).toBe("2000-09-03T22:00:00.000Z");
                expect(result[2].end_date_time.toISOString()).toBe("2000-09-04T13:00:00.000Z");
            })

    });


});