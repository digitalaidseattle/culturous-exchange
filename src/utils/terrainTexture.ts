/**
 *  terrainTexture.ts
 *
 *  Paints the land of a globe as a soft gradient of what the land is like: forest, grassland,
 *  desert, rock, tundra and ice, from the rough map in terrainGrid. Each pixel of the globe is
 *  traced back to the place on the earth it shows, and given the color of the map there, blended
 *  smoothly with the squares around it, so the colors fade into each other like a gradient mesh.
 *  The picture is a small bitmap, drawn again as the globe is turned, and put on the globe's land
 *  through the land's outline.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
    TERRAIN_CELL_DEGREES,
    TERRAIN_CLASSES,
    TERRAIN_COLUMNS,
    TERRAIN_ROWS,
    TERRAIN_ROWS_COUNT
} from "./terrainGrid";

type Rgb = [number, number, number];

const PALETTE: Rgb[] = TERRAIN_CLASSES.map(({ color }) => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)) as Rgb);
const CELLS: number[][] = TERRAIN_ROWS.map(row => Array.from(row, digit => Number(digit)));

const RADIANS = Math.PI / 180;

/** The class of land in the square of the map at this row and column (columns wrap round the earth). */
function cellAt(row: number, column: number): Rgb {
    const r = Math.max(0, Math.min(TERRAIN_ROWS_COUNT - 1, row));
    const c = ((column % TERRAIN_COLUMNS) + TERRAIN_COLUMNS) % TERRAIN_COLUMNS;
    return PALETTE[CELLS[r][c]];
}

/** The color of the land at a place, blended between the four squares of the map around it. */
export function terrainColorAt(lat: number, lng: number): Rgb {
    // the middle of a square is where it has its own color
    const y = (90 - lat) / TERRAIN_CELL_DEGREES - 0.5;
    const x = (lng + 180) / TERRAIN_CELL_DEGREES - 0.5;
    const row = Math.floor(y);
    const column = Math.floor(x);
    const down = y - row;
    const right = x - column;
    const corners: [Rgb, number][] = [
        [cellAt(row, column), (1 - down) * (1 - right)],
        [cellAt(row, column + 1), (1 - down) * right],
        [cellAt(row + 1, column), down * (1 - right)],
        [cellAt(row + 1, column + 1), down * right]
    ];
    const color: Rgb = [0, 0, 0];
    corners.forEach(([rgb, weight]) => { for (let i = 0; i < 3; i++) { color[i] += rgb[i] * weight; } });
    return color;
}

/**
 * The place on the earth that shows at a point on a globe facing the center: the point is given as
 * a fraction of the globe's radius to the right of its middle (u) and above it (v). Nothing is
 * returned for a point off the edge of the globe.
 */
export function unproject(u: number, v: number, center: [number, number]): { lat: number, lng: number } | undefined {
    const rho = Math.hypot(u, v);
    if (rho > 1) {
        return undefined;
    }
    const lng0 = center[0] * RADIANS;
    const lat0 = center[1] * RADIANS;
    if (rho === 0) {
        return { lat: center[1], lng: center[0] };
    }
    const c = Math.asin(rho);
    const lat = Math.asin(Math.cos(c) * Math.sin(lat0) + (v * Math.sin(c) * Math.cos(lat0)) / rho);
    const lng = lng0 + Math.atan2(u * Math.sin(c), rho * Math.cos(lat0) * Math.cos(c) - v * Math.sin(lat0) * Math.sin(c));
    return { lat: lat / RADIANS, lng: ((lng / RADIANS + 540) % 360) - 180 };
}

/** The bytes of a 24 bit bitmap picture, rows from the top, of `size` pixels each way. */
function bitmap(size: number, pixel: (x: number, y: number) => Rgb): Uint8Array {
    const rowBytes = (size * 3 + 3) & ~3;
    const bytes = new Uint8Array(54 + rowBytes * size);
    const view = new DataView(bytes.buffer);
    bytes[0] = 0x42; // B
    bytes[1] = 0x4d; // M
    view.setUint32(2, bytes.length, true);
    view.setUint32(10, 54, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, size, true);
    view.setInt32(22, -size, true); // a negative height: the rows run from the top
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(34, rowBytes * size, true);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const [r, g, b] = pixel(x, y);
            const at = 54 + y * rowBytes + x * 3;
            bytes[at] = Math.round(b);
            bytes[at + 1] = Math.round(g);
            bytes[at + 2] = Math.round(r);
        }
    }
    return bytes;
}

function dataUrl(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:image/bmp;base64,${btoa(binary)}`;
}

/** What is drawn where there is no earth, which is cut away by the land's outline anyway. */
const NOTHING: Rgb = [255, 255, 255];

/**
 * A picture of the land's colors for a globe facing `center`, as an image address. The picture is
 * `pixels` across and covers the globe's whole box, `size` units across, in which the globe has the
 * given `radius` and sits in the middle.
 */
export function terrainTexture(center: [number, number], size: number, radius: number, pixels: number): string {
    return dataUrl(bitmap(pixels, (x, y) => {
        const u = (((x + 0.5) / pixels) * size - size / 2) / radius;
        const v = (size / 2 - ((y + 0.5) / pixels) * size) / radius;
        const place = unproject(u, v, center);
        return place ? terrainColorAt(place.lat, place.lng) : NOTHING;
    }));
}
