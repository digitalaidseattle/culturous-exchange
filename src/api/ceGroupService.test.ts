/**
 *  planGenerator.test.ts
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from "vitest";
import { groupService } from "./ceGroupService";
import { timeWindowService } from "./ceTimeWindowService";
import { Group, TimeWindow } from "./types";

describe("groupService", () => {

    const dayNames = ['Fri', 'Sat', 'Sun'];
    function h12(hour24: number) {
        const h = hour24 % 12 === 0 ? 12 : hour24 % 12;
        const ampm = hour24 < 12 ? 'am' : 'pm';
        return `${h}${ampm}`;
    }
    function expectedString(dayOffset: number, startH: number, endH: number) {
        return `${dayNames[dayOffset]} ${h12(startH)} - ${h12(endH)}`;
    }

    it("createDefaultTimewindows", () => {

        const group = {
            id: "test"
        } as Group;

        const result = groupService.createDefaultTimewindows(group)

    expect(result.length).toBe(3);
    // Assert the created default windows using the service formatter (PST)
    // Implementation currently creates one full window per day (07:00 - 22:00)
    expect(timeWindowService.toString(result[0], 'America/Los_Angeles')).toBe(expectedString(0, 7, 22));
    expect(timeWindowService.toString(result[2], 'America/Los_Angeles')).toBe(expectedString(2, 7, 22));

    });

    it("deleteGroup", () => {
        const tw = {
            id: "twid"
        } as TimeWindow;

        const group = {
            id: "test",
            time_windows: [tw]
        } as Group;

        vi.spyOn(timeWindowService, "delete").mockResolvedValue();
        vi.spyOn(groupService, "delete").mockResolvedValue();
        groupService.deleteGroup(group)
            .then(_result => {
                expect(timeWindowService.delete).toBeCalledWith("twid");
                expect(groupService.delete).toBeCalledWith("test");
            })
    });



});