/**
 *  planNaming.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";
import { defaultPlanNumber, nextDefaultPlanName } from "./planNaming";

const named = (...names: string[]) => names.map(name => ({ name }));

describe("nextDefaultPlanName", () => {
    it("is Plan 1 for a cohort with no plans", () => {
        expect(nextDefaultPlanName([])).toBe("Plan 1");
        expect(nextDefaultPlanName(undefined)).toBe("Plan 1");
        expect(nextDefaultPlanName(null)).toBe("Plan 1");
    });

    it("is one more than the last default named plan", () => {
        expect(nextDefaultPlanName(named("Plan 1"))).toBe("Plan 2");
        expect(nextDefaultPlanName(named("Plan 1", "Plan 2", "Plan 3"))).toBe("Plan 4");
    });

    it("does not depend on the order of the plans", () => {
        expect(nextDefaultPlanName(named("Plan 3", "Plan 1", "Plan 2"))).toBe("Plan 4");
    });

    it("is Plan 4 when Plan 3 exists but there is no Plan 1", () => {
        expect(nextDefaultPlanName(named("Plan 3"))).toBe("Plan 4");
        expect(nextDefaultPlanName(named("Plan 2", "Plan 3"))).toBe("Plan 4");
    });

    it("gives Plan 1 back when Plan 1 was renamed and it was the only default named plan", () => {
        expect(nextDefaultPlanName(named("Spring groups"))).toBe("Plan 1");
        // Plan 1 renamed while it was the only one
        expect(nextDefaultPlanName(named("Final"))).toBe("Plan 1");
    });

    it("moves back down when the last default named plan is renamed", () => {
        expect(nextDefaultPlanName(named("Plan 1", "Plan 2", "Plan 3"))).toBe("Plan 4");
        expect(nextDefaultPlanName(named("Plan 1", "Plan 2", "Chosen"))).toBe("Plan 3");
    });

    it("keeps counting up from the highest number when an earlier plan is renamed", () => {
        expect(nextDefaultPlanName(named("Chosen", "Plan 2", "Plan 3"))).toBe("Plan 4");
    });

    it("ignores plans that have other names, including the old default", () => {
        expect(nextDefaultPlanName(named("New Plan", "My Plan", "Plan B", "Plan", "Plan 2 final", "Plan 2.5", "Plans 7"))).toBe("Plan 1");
        expect(nextDefaultPlanName(named("New Plan", "Plan 2", "Fall plan 9"))).toBe("Plan 3");
    });

    it("counts names with different capitals or spaces around them", () => {
        expect(nextDefaultPlanName(named("plan 5", "  PLAN 2  "))).toBe("Plan 6");
    });

    it("reads numbers with leading zeros, and two digit numbers", () => {
        expect(nextDefaultPlanName(named("Plan 007"))).toBe("Plan 8");
        expect(nextDefaultPlanName(named("Plan 9", "Plan 10"))).toBe("Plan 11");
    });

    it("does not count a plan twice, or care about repeated names", () => {
        expect(nextDefaultPlanName(named("Plan 2", "Plan 2"))).toBe("Plan 3");
    });
});

describe("defaultPlanNumber", () => {
    it("reads the number from a default name", () => {
        expect(defaultPlanNumber("Plan 12")).toBe(12);
    });

    it("is null for any other name", () => {
        expect(defaultPlanNumber("Plan")).toBeNull();
        expect(defaultPlanNumber("New Plan")).toBeNull();
        expect(defaultPlanNumber("")).toBeNull();
        expect(defaultPlanNumber(undefined)).toBeNull();
    });
});
