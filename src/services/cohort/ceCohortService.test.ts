/**
 *  ceCohortService.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.hoisted(() => vi.fn());
const save = vi.hoisted(() => vi.fn());
const getById = vi.hoisted(() => vi.fn());
const run = vi.hoisted(() => vi.fn());

// creating a plan writes to the database; stand in for the services that do it
vi.mock("../plan/cePlanService", () => ({ CEPlanService: { getInstance: () => ({ create, save }) } }));
vi.mock("../../api/cePlanDao", () => ({ CEPlanDao: { getInstance: () => ({ getById }) } }));
vi.mock("../plan/planGenerator", () => ({ PlanGenerator: { getInstance: () => ({ run }) } }));
vi.mock("../../services/ceEnrollmentService", () => ({ CEEnrollmentService: { getInstance: () => ({}) } }));

import { Cohort } from "../../api/types";
import { CECohortService } from "./ceCohortService";

const cohortWith = (...planNames: string[]) => ({ id: "c", name: "Cohort", plans: planNames.map(name => ({ name })) }) as unknown as Cohort;

describe("CECohortService.createPlan", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        create.mockResolvedValue({ id: "new" });
        getById.mockResolvedValue({ id: "new" });
        run.mockResolvedValue({ id: "new", name: "made" });
        save.mockImplementation(async plan => plan);
    });

    const nameUsed = () => create.mock.calls[0][1].name;

    it("names a plan with no name Plan 1 in a cohort with no plans", async () => {
        await CECohortService.getInstance().createPlan(cohortWith());
        expect(nameUsed()).toBe("Plan 1");
    });

    it("names a plan with no name after the cohort's last default named plan", async () => {
        await CECohortService.getInstance().createPlan(cohortWith("Plan 1", "Plan 2", "Plan 3"));
        expect(nameUsed()).toBe("Plan 4");
    });

    it("names it Plan 4 when Plan 3 exists but there is no Plan 1", async () => {
        await CECohortService.getInstance().createPlan(cohortWith("Plan 3", "Final"));
        expect(nameUsed()).toBe("Plan 4");
    });

    it("gives Plan 1 back when it was renamed and no other plan has a default name", async () => {
        await CECohortService.getInstance().createPlan(cohortWith("Final"));
        expect(nameUsed()).toBe("Plan 1");
    });

    it("keeps a name that was given", async () => {
        await CECohortService.getInstance().createPlan(cohortWith("Plan 1"), { name: "Spring groups" });
        expect(nameUsed()).toBe("Spring groups");
    });

    it("passes the group size and the shuffle seed on", async () => {
        await CECohortService.getInstance().createPlan(cohortWith(), { maxGroupSize: 7, shuffleSeed: 5, minGroupSize: 3, minOverlapHours: 1 });
        expect(create.mock.calls[0][1].group_size).toBe(7);
        expect(run.mock.calls[0][1]).toEqual({ minOverlapHours: 1, minGroupSize: 3, shuffleSeed: 5 });
    });
});
