/**
 *  PlanStatusChip.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ACTIVE_STATUS_BORDER, ACTIVE_STATUS_SURFACE } from "../utils/styles";
import { PlanStatusChip } from "./PlanStatusChip";

const theme = createTheme({ palette: { text: { primary: "#262626" } } });
const chip = (active: boolean) => {
    render(<ThemeProvider theme={theme}><PlanStatusChip active={active} /></ThemeProvider>);
    return screen.getByText(active ? "Active" : "Inactive").closest(".MuiChip-root") as HTMLElement;
};

const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a: string, b: string) => {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
};

describe("PlanStatusChip", () => {
    it("says Active or Inactive", () => {
        expect(chip(true).textContent).toBe("Active");
    });

    it("says Inactive for a plan that is not active", () => {
        expect(chip(false).textContent).toBe("Inactive");
    });

    it("uses the main text color for both, not the green", () => {
        expect(getComputedStyle(chip(true)).color).toBe("rgb(38, 38, 38)");
    });

    it("uses the main text color on the inactive tag too", () => {
        expect(getComputedStyle(chip(false)).color).toBe("rgb(38, 38, 38)");
    });

    it("gives an active plan the pale mint green surface and border", () => {
        const style = getComputedStyle(chip(true));
        expect(style.backgroundColor).toBe("rgb(226, 240, 223)");
        expect(style.borderColor).toBe("rgb(159, 207, 153)");
    });

    it("gives an inactive plan no fill", () => {
        const style = getComputedStyle(chip(false));
        expect(["", "transparent", "rgba(0, 0, 0, 0)"]).toContain(style.backgroundColor);
    });

    it("is readable: the text on the mint surface passes the WCAG AAA contrast of 7 to 1", () => {
        expect(contrast("#262626", ACTIVE_STATUS_SURFACE)).toBeGreaterThanOrEqual(7);
    });

    it("keeps the surface light and green, not grey or saturated", () => {
        const [r, g, b] = [1, 3, 5].map(i => parseInt(ACTIVE_STATUS_SURFACE.slice(i, i + 2), 16));
        expect(g).toBeGreaterThan(r);
        expect(g).toBeGreaterThan(b);
        expect(g).toBeGreaterThan(220);
        // soft: little difference between the channels
        expect(g - Math.min(r, b)).toBeLessThan(30);
        expect(ACTIVE_STATUS_BORDER).toMatch(/^#[0-9a-f]{6}$/);
    });
});
