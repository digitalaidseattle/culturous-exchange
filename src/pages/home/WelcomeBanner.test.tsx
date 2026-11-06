/**
 *  WelcomeBanner.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WelcomeBanner } from "./WelcomeBanner";

describe("WelcomeBanner", () => {
    it("is the page's main heading", () => {
        render(<WelcomeBanner />);
        expect(screen.getByRole("heading", { level: 1, name: "Welcome to Culturous Exchange" })).toBeTruthy();
    });

    it("says what the site is for", () => {
        render(<WelcomeBanner />);
        expect(screen.getByText("Build cohorts, make plans, and schedule culturous exchange.")).toBeTruthy();
    });

    it("tells the user where to start", () => {
        render(<WelcomeBanner />);
        expect(screen.getByText("Get started:")).toBeTruthy();
        expect(screen.getByText(/Jump into the Current Cohort or Start planning for the future\./)).toBeTruthy();
    });
});
