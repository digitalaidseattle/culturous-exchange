/**
 *  overlapColors.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { green, orange, red, yellow } from "@ant-design/colors";
import { describe, expect, it } from "vitest";
import { colorAt } from "./gradient";
import { OVERLAP_COLOR_STOPS } from "./overlapColors";

// the scale gives colors as rgb(), the palette as hex
const rgb = (hex: string) => `rgb(${[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const at = (hours: number) => colorAt(OVERLAP_COLOR_STOPS, hours);

describe("overlap color scale", () => {
    it("is red at 0 hours and orange at 1", () => {
        expect(at(0)).toBe(rgb(red.primary!));
        expect(at(1)).toBe(rgb(orange.primary!));
    });

    it("is yellow from 2 to 3 hours", () => {
        expect(at(2)).toBe(rgb(yellow.primary!));
        expect(at(2.5)).toBe(rgb(yellow.primary!));
        expect(at(3)).toBe(rgb(yellow.primary!));
    });

    it("is green from 4 hours on, blending toward it after 3", () => {
        expect(at(4)).toBe(rgb(green.primary!));
        expect(at(6)).toBe(rgb(green.primary!));
        expect(at(3.5)).not.toBe(rgb(yellow.primary!));
        expect(at(3.5)).not.toBe(rgb(green.primary!));
    });

    it("is no longer yellow at 4 hours, which it was before green moved one hour sooner", () => {
        expect(at(4)).not.toBe(rgb(yellow.primary!));
    });
});
