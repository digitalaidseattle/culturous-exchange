/**
 *  gradient.ts
 *
 *  A color scale for chart values.
 *
 *  A scale is a few values with a color at each. Between two values the color
 *  blends smoothly, before the first it stays the first color, and after the
 *  last it stays the last color. So a value has the same color wherever a chart's
 *  axis happens to start.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { decomposeColor } from "@mui/material/styles";

export type ColorStop = {
    /** a position on the axis, in the unit of the axis */
    value: number;
    /** any css color written as hex, rgb() or hsl() */
    color: string;
};

const toRgb = (color: string): [number, number, number] => {
    const { type, values } = decomposeColor(color);
    if (type === 'rgb' || type === 'rgba') {
        return [values[0], values[1], values[2]];
    }
    // hsl and other forms are not used here; keep them from breaking the chart
    return [128, 128, 128];
};

/** Any css color, written as rgb(r, g, b). Every color this file hands back is in this form. */
const asRgb = (color: string): string => {
    const [r, g, b] = toRgb(color);
    return `rgb(${r}, ${g}, ${b})`;
};

/** The color a fraction of the way (0 to 1) from one color to another. */
export function mixColors(from: string, to: string, fraction: number): string {
    const [r1, g1, b1] = toRgb(from);
    const [r2, g2, b2] = toRgb(to);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * fraction);
    return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

/** The color of the scale at a value. */
export function colorAt(stops: ColorStop[], value: number): string {
    const sorted = [...stops].sort((a, b) => a.value - b.value);
    if (value <= sorted[0].value) {
        return asRgb(sorted[0].color);
    }
    for (let i = 1; i < sorted.length; i++) {
        if (value <= sorted[i].value) {
            const span = sorted[i].value - sorted[i - 1].value;
            return span === 0 ? asRgb(sorted[i].color) : mixColors(sorted[i - 1].color, sorted[i].color, (value - sorted[i - 1].value) / span);
        }
    }
    return asRgb(sorted[sorted.length - 1].color);
}
