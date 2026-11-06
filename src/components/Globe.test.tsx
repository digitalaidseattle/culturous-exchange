/**
 *  Globe.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { GLOBE_COLORS, GLOBE_DOT_EDGE, GLOBE_LAND, globeColor } from "../utils/globeColors";
import { initialCenter, isFacing } from "../utils/globeView";
import { Globe, GlobePoint } from "./Globe";

const lima: GlobePoint = { id: "lima", lat: -12.04, lng: -77.03, color: "#d4380d", label: "Lima, Peru" };
const cairo: GlobePoint = { id: "cairo", lat: 30.04, lng: 31.24, color: "#1d39c4", label: "Cairo, Egypt" };
const madrid: GlobePoint = { id: "madrid", lat: 40.42, lng: -3.7, color: "#389e0d", label: "Madrid, Spain" };

describe("initialCenter", () => {
    it("faces the middle of the places", () => {
        const [lng, lat] = initialCenter([cairo, madrid]);
        expect(lng).toBeGreaterThan(-3.7);
        expect(lng).toBeLessThan(31.24);
        expect(lat).toBeGreaterThan(30);
        expect(lat).toBeLessThan(41);
    });

    it("faces the Atlantic when there are no places", () => {
        expect(initialCenter([])).toEqual([-20, 20]);
    });
});

describe("isFacing", () => {
    it("is true for places on the near side and false for the far side", () => {
        expect(isFacing(cairo, [31, 30])).toBe(true);
        expect(isFacing(lima, [100, 0])).toBe(false);
    });
});

describe("Globe", () => {
    // the test runtime has no pointer events, which carry where the pointer is; mouse events are the nearest thing
    beforeAll(() => {
        if (typeof window.PointerEvent === "undefined") {
            Object.defineProperty(window, "PointerEvent", { configurable: true, value: class extends MouseEvent { } });
        }
    });

    it("draws the sea, the land, and a colored dot for each place on the near side", () => {
        const { container } = render(<Globe label="Group 1 cities" points={[cairo, madrid]} />);
        expect(container.querySelector('[data-part="sea"]')!.getAttribute("d")).toBeTruthy();
        expect(container.querySelector('[data-part="land"]')!.getAttribute("d")!.length).toBeGreaterThan(100);
        const dots = Array.from(container.querySelectorAll("circle"));
        expect(dots.map(dot => dot.getAttribute("data-place")).sort()).toEqual(["cairo", "madrid"]);
        expect(dots.find(dot => dot.getAttribute("data-place") === "cairo")!.getAttribute("fill")).toBe("#1d39c4");
    });

    it("hides places on the far side of the globe", () => {
        // facing Cairo and Madrid, Lima is on the other side
        const { container } = render(<Globe label="Group 1 cities" points={[cairo, madrid, { ...lima, lng: 150, lat: -30 }]} />);
        const dots = Array.from(container.querySelectorAll("circle")).map(dot => dot.getAttribute("data-place"));
        expect(dots).not.toContain("lima");
    });

    it("is read as a list of the places", () => {
        render(<Globe label="Group 1 cities" points={[cairo, madrid]} />);
        expect(screen.getByRole("img", { name: "Group 1 cities: Cairo, Egypt; Madrid, Spain" })).toBeTruthy();
    });

    it("says so when there are no places, and draws no dots", () => {
        const { container } = render(<Globe label="Group 1 cities" points={[]} />);
        expect(screen.getByRole("img", { name: "Group 1 cities: no places" })).toBeTruthy();
        expect(container.querySelectorAll("circle")).toHaveLength(0);
    });

    it("turns when dragged, bringing other places into view", () => {
        const { container } = render(<Globe label="G" size={200} points={[cairo, { ...lima, lat: 30, lng: 130 }]} />);
        const globe = screen.getByRole("img");
        const visible = () => Array.from(container.querySelectorAll("circle")).map(dot => dot.getAttribute("data-place"));
        const before = visible();
        // the two places are far apart, so only the nearer to the middle is facing
        expect(before.length).toBeLessThanOrEqual(2);
        fireEvent.pointerDown(globe, { clientX: 100, clientY: 100, pointerId: 1 });
        fireEvent.pointerMove(globe, { clientX: 0, clientY: 100, pointerId: 1 });
        fireEvent.pointerUp(globe, { pointerId: 1 });
        // dragging left by the globe's width turns it away from where it was facing
        expect(visible()).not.toEqual(before);
        expect(visible().length).toBeGreaterThan(0);
    });

    it("turns to face the places again when they change", () => {
        const { container, rerender } = render(<Globe label="G" points={[cairo]} />);
        expect(container.querySelectorAll("circle")).toHaveLength(1);
        rerender(<Globe label="G" points={[lima]} />);
        expect(Array.from(container.querySelectorAll("circle")).map(dot => dot.getAttribute("data-place"))).toEqual(["lima"]);
    });

    it("colors the land with a picture of its terrain, cut to the coastlines", () => {
        const { container } = render(<Globe label="G" size={200} points={[cairo]} />);
        const image = container.querySelector('image[data-part="terrain"]')!;
        expect(image.getAttribute("href")).toMatch(/^data:image\/bmp;base64,/);
        // the picture covers the globe's box, and is shown only where there is land
        expect(image.getAttribute("width")).toBe("200");
        expect(image.getAttribute("height")).toBe("200");
        const clip = image.getAttribute("clip-path")!.match(/url\(#(.+)\)/)![1];
        const clipPath = container.ownerDocument.getElementById(clip)!;
        expect(clipPath.tagName.toLowerCase()).toBe("clippath");
        expect(clipPath.querySelector("path")!.getAttribute("d")).toBe(container.querySelector('[data-part="land"]')!.getAttribute("d"));
    });

    it("keeps white land under the terrain, and draws the coastline over it", () => {
        const { container } = render(<Globe label="G" points={[cairo]} />);
        const parts = Array.from(container.querySelectorAll("[data-part]")).map(part => part.getAttribute("data-part"));
        expect(parts.indexOf("land")).toBeLessThan(parts.indexOf("terrain"));
        expect(parts.indexOf("terrain")).toBeLessThan(parts.indexOf("coast"));
        expect(getComputedStyle(container.querySelector('[data-part="coast"]')!).fill).toBe("none");
    });

    it("gives each globe its own clip, so two globes on a page do not share one", () => {
        const { container } = render(<><Globe label="A" points={[cairo]} /><Globe label="B" points={[lima]} /></>);
        const ids = Array.from(container.querySelectorAll("clipPath")).map(clip => clip.id);
        expect(ids).toHaveLength(2);
        expect(ids[0]).not.toBe(ids[1]);
    });

    it("paints the terrain again when the globe is turned", () => {
        const { container } = render(<Globe label="G" size={200} points={[cairo]} />);
        const globe = screen.getByRole("img");
        const before = container.querySelector('image[data-part="terrain"]')!.getAttribute("href");
        fireEvent.pointerDown(globe, { clientX: 100, clientY: 100, pointerId: 1 });
        fireEvent.pointerMove(globe, { clientX: 20, clientY: 100, pointerId: 1 });
        fireEvent.pointerUp(globe, { pointerId: 1 });
        expect(container.querySelector('image[data-part="terrain"]')!.getAttribute("href")).not.toBe(before);
    });

    it("draws the land white on a pale blue sea", () => {
        const { container } = render(<Globe label="G" points={[cairo]} />);
        expect(getComputedStyle(container.querySelector('[data-part="land"]')!).fill).toBe(GLOBE_LAND);
        const [r, g, b] = getComputedStyle(container.querySelector('[data-part="sea"]')!).fill.match(/\d+/g)!.map(Number);
        // light, and more blue than red
        expect(Math.min(r, g, b)).toBeGreaterThan(200);
        expect(b).toBeGreaterThan(r);
    });

    it("gives each dot a thin darker edge, so a soft color still shows against the land", () => {
        const { container } = render(<Globe label="G" points={[cairo]} />);
        expect(container.querySelector("circle")!.getAttribute("stroke")).toBe(GLOBE_DOT_EDGE);
    });
});

describe("globe colors", () => {
    // relative luminance and saturation, for "light" and "soft"
    const channels = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lightness = (hex: string) => { const c = channels(hex); return (Math.max(...c) + Math.min(...c)) / 2; };
    const saturation = (hex: string) => { const c = channels(hex); const max = Math.max(...c), min = Math.min(...c); return max === min ? 0 : (max - min) / (1 - Math.abs(max + min - 1)); };

    it("are all light and not fully saturated", () => {
        GLOBE_COLORS.forEach(color => {
            expect(lightness(color), color).toBeGreaterThan(0.6);
            expect(saturation(color), color).toBeLessThan(0.7);
        });
    });

    it("are all different", () => {
        expect(new Set(GLOBE_COLORS).size).toBe(GLOBE_COLORS.length);
    });

    it("go to the countries in alphabetical order, and start again after the last color", () => {
        const countries = Array.from({ length: GLOBE_COLORS.length + 1 }, (_, i) => `Country ${String(i).padStart(2, "0")}`);
        expect(globeColor("Country 00", countries)).toBe(GLOBE_COLORS[0]);
        expect(globeColor("Country 01", countries)).toBe(GLOBE_COLORS[1]);
        expect(globeColor(`Country ${String(GLOBE_COLORS.length).padStart(2, "0")}`, countries)).toBe(GLOBE_COLORS[0]);
    });
});
