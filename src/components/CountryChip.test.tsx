/**
 *  CountryChip.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UNKNOWN_COUNTRY_FLAG } from "../utils/countryFlag";
import { CountryChip } from "./CountryChip";

describe("CountryChip", () => {
    it("shows the flag, the country name as typed, then the number of students", () => {
        const { container } = render(<CountryChip country="Brazil" count={8} />);
        expect(screen.getByText("Brazil", { exact: false })).toBeTruthy();
        expect(container.textContent).toBe("\u{1F1E7}\u{1F1F7}Brazil8 students");
    });

    it("shows the number in bold", () => {
        const { container } = render(<CountryChip country="Brazil" count={8} />);
        const bold = container.querySelector("strong")!;
        expect(bold.textContent).toBe("8");
        // the name is not bold
        expect(container.querySelector("strong")?.parentElement?.textContent).toContain("Brazil");
        expect(container.querySelectorAll("strong")).toHaveLength(1);
    });

    it("says 'student' for one and 'students' otherwise, for screen readers", () => {
        const one = render(<CountryChip country="Kenya" count={1} />);
        expect(one.container.textContent).toContain("1 student");
        expect(one.container.textContent).not.toContain("1 students");
        const many = render(<CountryChip country="Kenya" count={3} />);
        expect(many.container.textContent).toContain("3 students");
    });

    it("hides the word 'students' from the eye but not from screen readers", () => {
        const { container } = render(<CountryChip country="Kenya" count={3} />);
        const hidden = Array.from(container.querySelectorAll("span")).find(span => span.textContent === " students")!;
        expect(hidden.style.position).toBe("absolute");
        expect(hidden.getAttribute("aria-hidden")).toBeNull();
    });

    it("finds the flag for a differently typed name", () => {
        const { container } = render(<CountryChip country="PAKISTAN" count={2} />);
        expect(container.textContent?.startsWith("\u{1F1F5}\u{1F1F0}PAKISTAN2")).toBe(true);
    });

    it("shows a globe for a country it does not know", () => {
        const { container } = render(<CountryChip country="Narnia" count={1} />);
        expect(container.textContent?.startsWith(`${UNKNOWN_COUNTRY_FLAG}Narnia`)).toBe(true);
    });

    it("hides the flag from screen readers", () => {
        const { container } = render(<CountryChip country="Kenya" count={3} />);
        expect(container.querySelector("[aria-hidden='true']")?.textContent).toBe("\u{1F1F0}\u{1F1EA}");
    });
});
