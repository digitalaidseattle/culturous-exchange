/**
 *  terrainTexture.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { geoOrthographic } from "d3-geo";
import { describe, expect, it } from "vitest";
import {
    TERRAIN_CELL_DEGREES,
    TERRAIN_CLASSES,
    TERRAIN_COLUMNS,
    TERRAIN_ROWS,
    TERRAIN_ROWS_COUNT
} from "./terrainGrid";
import { terrainColorAt, terrainTexture, unproject } from "./terrainTexture";

const hex = (color: string) => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
const classColor = (name: string) => hex(TERRAIN_CLASSES.find(k => k.name === name)!.color);
/** How far the color is from a class's color, as the largest difference in a channel. */
const distance = (a: number[], b: number[]) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
/** The class whose color is nearest. */
const nearest = (color: number[]) => TERRAIN_CLASSES.map(k => k.name).sort((a, b) => distance(color, classColor(a)) - distance(color, classColor(b)))[0];

describe("the terrain map", () => {
    it("is a grid of 3 degree squares, 120 across and 60 down", () => {
        expect(TERRAIN_CELL_DEGREES).toBe(3);
        expect(TERRAIN_COLUMNS * TERRAIN_CELL_DEGREES).toBe(360);
        expect(TERRAIN_ROWS_COUNT * TERRAIN_CELL_DEGREES).toBe(180);
        expect(TERRAIN_ROWS).toHaveLength(TERRAIN_ROWS_COUNT);
        TERRAIN_ROWS.forEach(row => expect(row).toHaveLength(TERRAIN_COLUMNS));
    });

    it("only uses digits for kinds of land it has", () => {
        TERRAIN_ROWS.join("").split("").forEach(digit => expect(Number(digit)).toBeLessThan(TERRAIN_CLASSES.length));
    });

    it("has forest, grassland, desert, rock, tundra and ice among its kinds of land", () => {
        const names = TERRAIN_CLASSES.map(k => k.name);
        ["forest", "grassland", "desert", "rocky", "tundra", "ice"].forEach(name => expect(names).toContain(name));
    });

    it("has soft, light colors for every kind of land", () => {
        TERRAIN_CLASSES.forEach(({ color, name }) => {
            const [r, g, b] = hex(color);
            expect(Math.min(r, g, b), name).toBeGreaterThan(80);
        });
    });
});

describe("terrainColorAt", () => {
    // places chosen to be well inside the kind of land they are known for
    it.each([
        ["the Sahara", 23, 10, "desert"],
        ["the Amazon", -3, -60, "rainforest"],
        ["the Congo basin", 0, 22, "rainforest"],
        ["the Siberian forest", 60, 100, "forest"],
        ["Greenland", 72, -40, "ice"],
        ["Antarctica", -80, 0, "ice"],
        ["the Himalaya", 30, 85, "rocky"],
        ["the Australian interior", -25, 135, "dryland"]
    ])("is %s: %s", (_name, lat, lng, kind) => {
        const color = terrainColorAt(lat, lng);
        expect(distance(color, classColor(kind))).toBeLessThan(40);
        expect(nearest(color)).toBe(kind);
    });

    it("blends smoothly between squares, rather than jumping", () => {
        // walk across the edge of the Sahara in small steps: no step changes the color by much
        let last = terrainColorAt(23, 10);
        for (let lat = 23; lat <= 33; lat += 0.25) {
            const color = terrainColorAt(lat, 10);
            expect(distance(color, last)).toBeLessThan(25);
            last = color;
        }
    });

    it("is the colour of a square at the middle of that square", () => {
        // the square from 21 to 24 degrees north and 9 to 12 degrees east has its middle at 22.5 north, 10.5 east
        const row = Math.floor((90 - 22.5) / 3);
        const column = Math.floor((10.5 + 180) / 3);
        const own = TERRAIN_CLASSES[Number(TERRAIN_ROWS[row][column])].color;
        expect(terrainColorAt(22.5, 10.5)).toEqual(hex(own));
    });

    it("carries on across the date line and the poles without a gap", () => {
        const west = terrainColorAt(0, -179.99);
        const east = terrainColorAt(0, 179.99);
        expect(distance(west, east)).toBeLessThan(5);
        expect(terrainColorAt(90, 0)).toHaveLength(3);
        expect(terrainColorAt(-90, 200)).toHaveLength(3);
    });
});

describe("unproject", () => {
    it("is the center in the middle of the globe", () => {
        expect(unproject(0, 0, [31, 30])).toEqual({ lat: 30, lng: 31 });
    });

    it("is nothing off the edge of the globe", () => {
        expect(unproject(1.01, 0, [0, 0])).toBeUndefined();
        expect(unproject(0.8, 0.8, [0, 0])).toBeUndefined();
    });

    it("finds the same places as the projection the globe is drawn with", () => {
        [[0, 0], [31, 30], [-77, -12], [150, -30], [-120, 60]].forEach(center => {
            const projection = geoOrthographic().translate([0, 0]).scale(1).rotate([-center[0], -center[1]]);
            [[0.3, 0.2], [-0.5, 0.1], [0.1, -0.7], [-0.6, -0.6], [0.9, 0]].forEach(([u, v]) => {
                const place = unproject(u, v, center as [number, number])!;
                // the drawing runs down the page, so up is the other way
                const expected = projection.invert!([u, -v])!;
                expect(place.lng).toBeCloseTo(((expected[0] + 540) % 360) - 180, 4);
                expect(place.lat).toBeCloseTo(expected[1], 4);
            });
        });
    });

    it("puts east to the right and north up", () => {
        expect(unproject(0.5, 0, [0, 0])!.lng).toBeGreaterThan(0);
        expect(unproject(-0.5, 0, [0, 0])!.lng).toBeLessThan(0);
        expect(unproject(0, 0.5, [0, 0])!.lat).toBeGreaterThan(0);
        expect(unproject(0, -0.5, [0, 0])!.lat).toBeLessThan(0);
    });
});

describe("terrainTexture", () => {
    const decode = (url: string) => {
        expect(url.startsWith("data:image/bmp;base64,")).toBe(true);
        return Uint8Array.from(atob(url.slice("data:image/bmp;base64,".length)), char => char.charCodeAt(0));
    };
    const pixel = (bytes: Uint8Array, size: number, x: number, y: number) => {
        const rowBytes = (size * 3 + 3) & ~3;
        const at = 54 + y * rowBytes + x * 3;
        return [bytes[at + 2], bytes[at + 1], bytes[at]];
    };

    it("is a bitmap picture of the size asked for, with the rows from the top", () => {
        const bytes = decode(terrainTexture([0, 0], 100, 48, 20));
        const view = new DataView(bytes.buffer);
        expect(String.fromCharCode(bytes[0], bytes[1])).toBe("BM");
        expect(view.getUint32(2, true)).toBe(bytes.length);
        expect(view.getInt32(18, true)).toBe(20);
        expect(view.getInt32(22, true)).toBe(-20);
        expect(view.getUint16(28, true)).toBe(24);
        // 20 pixels of 3 bytes make a row of 60, which is already a multiple of 4
        expect(bytes.length).toBe(54 + 60 * 20);
    });

    it("pads rows to a multiple of four bytes", () => {
        const bytes = decode(terrainTexture([0, 0], 100, 48, 21));
        expect(bytes.length).toBe(54 + 64 * 21);
    });

    it("has the color of the land at the center of the globe in the middle of the picture", () => {
        // facing the Sahara
        const size = 21;
        const bytes = decode(terrainTexture([10, 23], 100, 48, size));
        const middle = pixel(bytes, size, 10, 10);
        expect(nearest(middle)).toBe("desert");
    });

    it("has green at the center when facing the Amazon, and ice when facing Greenland", () => {
        const size = 21;
        expect(nearest(pixel(decode(terrainTexture([-60, -3], 100, 48, size)), size, 10, 10))).toBe("rainforest");
        expect(nearest(pixel(decode(terrainTexture([-40, 72], 100, 48, size)), size, 10, 10))).toBe("ice");
    });

    it("has white where there is no earth, in the corners", () => {
        const size = 21;
        expect(pixel(decode(terrainTexture([0, 0], 100, 48, size)), size, 0, 0)).toEqual([255, 255, 255]);
    });

    it("is a different picture when the globe is turned", () => {
        expect(terrainTexture([0, 0], 100, 48, 20)).not.toBe(terrainTexture([90, 0], 100, 48, 20));
    });

    it("is the same picture for the same view", () => {
        expect(terrainTexture([12, 34], 132, 64, 66)).toBe(terrainTexture([12, 34], 132, 64, 66));
    });
});
