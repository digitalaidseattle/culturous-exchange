/**
 *  globeColors.ts
 *
 *  The colors of the dots on a group's globe: one for each country in the group, the same on the
 *  globe and in the key beside it. Soft, lighter colors that are a little muted, and still stand
 *  apart from each other, and from the globe's light blue sea and grey land (the dots have a thin
 *  darker edge to keep them visible).
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
export const GLOBE_COLORS = [
    '#e49a8b', '#8aa6e6', '#88c9a0', '#dca6c4', '#e4c07f',
    '#7fc4c9', '#b7a6e4', '#e8b184', '#97c0ea', '#bcd08a'
];

/** The thin edge on a dot and on its swatch in the key. */
export const GLOBE_DOT_EDGE = 'rgba(38, 38, 38, 0.35)';

/** The color for a country, by its place in the alphabetical list of the countries on this globe. */
export function globeColor(country: string, countries: string[]): string {
    const index = [...countries].sort((a, b) => a.localeCompare(b)).indexOf(country);
    return GLOBE_COLORS[(index < 0 ? 0 : index) % GLOBE_COLORS.length];
}

/** The globe: white land on a pale blue sea (the theme's blue, lightened), with dark charcoal behind it. */
export const GLOBE_LAND = '#ffffff';
export const GLOBE_BACKDROP = '#2a2d32';
