import { describe, expect, it } from "vitest";
import { timeWindowService } from "./ceTimeWindowService";

describe("timeWindowService", () => {

    it("toDateTime", () => {

        const result = timeWindowService.toDateTime(1, "08:00:00", 0);
        console.log(result);

        expect(result.getDate()).toBe(1);
        expect(result.getHours()).toBe(8);
    });

});