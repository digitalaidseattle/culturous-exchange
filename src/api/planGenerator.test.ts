/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { planGenerator } from "./planGenerator";
import { Group, Plan } from "./types";

describe("planGenerator", () => {

    it("createGroups", () => {

        const plan = {
            id: "test"
        } as Plan;

        planGenerator.createGroups(plan, 2)
            .then(result => {
                expect(result.length).toBe(2);
                expect(result[0].id).toBeDefined();
                expect(result[0].plan_id).toBe("test");
                expect(result[0].name).toBe("Group 1");
                expect(result[0].country_count).toBe(0);
                expect(result[0].time_windows?.length).toBe(3);
                expect(result[0].placements?.length).toBe(0);
                expect(result[1].id).toBeDefined();
                expect(result[1].plan_id).toBe("test");
                expect(result[1].name).toBe("Group 2");
            })

    });


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