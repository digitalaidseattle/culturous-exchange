/**
 *  Globe.tsx
 *
 *  A small globe with a dot for each place. It is drawn as SVG from the open Natural Earth
 *  coastlines (the world-atlas package) with d3-geo's orthographic projection, so there is no
 *  map service to load and it is quick enough for a card on every group. The land is colored with a
 *  soft gradient of what it is like (see terrainTexture) on a pale blue sea. It opens turned to face the dots, and can be dragged to turn it. Dots on the far
 *  side are hidden.
 *
 *  The picture stands for the key beside it (the places and countries are listed there too), so
 *  it is described to screen readers as a list of the places rather than read as shapes.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box } from "@mui/material";
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import landTopology from "world-atlas/land-110m.json";
import { alpha, lighten } from "@mui/material/styles";
import { GLOBE_DOT_EDGE, GLOBE_LAND } from "../utils/globeColors";
import { terrainTexture } from "../utils/terrainTexture";
import { initialCenter, isFacing } from "../utils/globeView";

export type GlobePoint = {
    id: string,
    lat: number,
    lng: number,
    color: string,
    /** what a screen reader says for the dot: "Lima, Peru" */
    label: string
};

const LAND = feature(
    landTopology as unknown as Topology,
    (landTopology as unknown as Topology).objects.land
) as unknown as GeoPermissibleObjects;
const GRATICULE = geoGraticule10();

export const Globe: React.FC<{ points: GlobePoint[], size?: number, label: string }> = ({ points, size = 168, label }) => {
    const [center, setCenter] = useState<[number, number]>(() => initialCenter(points));
    const drag = useRef<{ x: number, y: number, center: [number, number] } | null>(null);

    // turn to face the dots again when the places change
    const placesKey = points.map(point => `${point.lat},${point.lng}`).join('|');
    useEffect(() => {
        setCenter(initialCenter(points));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placesKey]);

    const radius = size / 2 - 2;
    const projection = useMemo(
        () => geoOrthographic().translate([size / 2, size / 2]).scale(radius).rotate([-center[0], -center[1]]).clipAngle(90),
        [size, radius, center]);
    const path = useMemo(() => geoPath(projection), [projection]);
    const landPath = useMemo(() => path(LAND) ?? undefined, [path]);

    // the land's colors, drawn at half the globe's size: they are a soft gradient, so nothing is lost
    const clipId = useId();
    const terrain = useMemo(() => terrainTexture(center, size, radius, Math.ceil(size / 2)), [center, size, radius]);

    const dotRadius = Math.max(4, size / 30);
    const visible = points.filter(point => isFacing(point, center));

    const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
        drag.current = { x: event.clientX, y: event.clientY, center };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
        const start = drag.current;
        if (!start || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
            return;
        }
        // about a quarter turn across the globe's width
        const degreesPerPixel = 90 / radius;
        setCenter([
            start.center[0] - (event.clientX - start.x) * degreesPerPixel,
            Math.max(-80, Math.min(80, start.center[1] + (event.clientY - start.y) * degreesPerPixel))
        ]);
    };
    const onPointerUp = () => { drag.current = null; };

    const description = points.length === 0 ? 'no places' : points.map(point => point.label).join('; ');

    return (
        <Box
            component="svg"
            role="img"
            aria-label={`${label}: ${description}`}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            sx={{ display: 'block', touchAction: 'none', cursor: 'grab', '&:active': { cursor: 'grabbing' }, maxWidth: '100%', height: 'auto' }}>
            {/* the sea is the pale blue it always was: the theme's blue, lightened (an opaque color, so it is the same on the charcoal behind it) */}
            <Box component="path" data-part="sea" d={path({ type: 'Sphere' }) ?? undefined}
                sx={{ fill: (theme) => lighten(theme.palette.primary.main, 0.88), stroke: (theme) => theme.palette.divider, strokeWidth: 0.75 }} />
            <Box component="path" data-part="graticule" d={path(GRATICULE) ?? undefined}
                sx={{ fill: 'none', stroke: (theme) => alpha(theme.palette.primary.main, 0.18), strokeWidth: 0.5 }} />
            <defs>
                <clipPath id={`${clipId}-land`}><path d={landPath} /></clipPath>
            </defs>
            {/* white land, with its colors over it: forest, grassland, desert, rock, tundra and ice, as a gradient */}
            <Box component="path" data-part="land" d={landPath}
                sx={{ fill: GLOBE_LAND, stroke: 'none' }} />
            <image data-part="terrain" href={terrain} x={0} y={0} width={size} height={size} clipPath={`url(#${clipId}-land)`} />
            <Box component="path" data-part="coast" d={landPath}
                sx={{ fill: 'none', stroke: 'rgba(42, 45, 50, 0.3)', strokeWidth: 0.4 }} />
            {visible.map(point => {
                const at = projection([point.lng, point.lat]);
                return at && (
                    <circle
                        key={point.id}
                        data-place={point.id}
                        cx={at[0]}
                        cy={at[1]}
                        r={dotRadius}
                        fill={point.color}
                        stroke={GLOBE_DOT_EDGE}
                        strokeWidth={1} />
                );
            })}
        </Box>
    );
};
