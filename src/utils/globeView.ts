/**
 *  globeView.ts
 *
 *  Where a globe faces, and which of its places can be seen.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { geoCentroid, geoDistance } from "d3-geo";

type LatLng = { lat: number, lng: number };

/** Where the globe faces when it opens: the middle of the dots, or the Atlantic if there are none. */
export function initialCenter(points: LatLng[]): [number, number] {
    if (points.length === 0) {
        return [-20, 20];
    }
    const [lng, lat] = geoCentroid({
        type: 'MultiPoint',
        coordinates: points.map(point => [point.lng, point.lat])
    });
    return [lng, Math.max(-60, Math.min(60, lat))];
}

/** Whether the point is on the side of the globe that faces us. */
export function isFacing(point: LatLng, center: [number, number]): boolean {
    return geoDistance([point.lng, point.lat], center) < Math.PI / 2 - 0.02;
}
