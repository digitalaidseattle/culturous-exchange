/**
 *  LocationGlobe.tsx
 *
 *  A globe with a colored dot for each city a set of students is from, and, to the right of it
 *  in a white container, a key of the countries with how many students are from each. The key
 *  drops below the globe when there is no room. Cities are looked up in the browser (see
 *  usePlaceCoordinates), so the key says so while it works and how many cities it could not place.
 *  It is the same on a group's card and on a cohort's page, which is why it has a name of its own:
 *  `name` starts the labels read out for the globe and the key ("Group 1 cities", "Group 1 countries").
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Box, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { Placement, Student } from "../api/types";
import { UI_STRINGS } from "../constants";
import { Place, placeKey } from "../services/geo/cityCoordinates";
import { usePlaceCoordinates } from "../services/geo/usePlaceCoordinates";
import { countriesOf } from "../services/plan/groupFit";
import { normalizeCountryName } from "../utils/countryFlag";
import { GLOBE_DOT_EDGE, globeColor } from "../utils/globeColors";
import { Globe, GlobePoint } from "./Globe";

/** How big the globe is drawn, unless asked otherwise. */
export const DEFAULT_GLOBE_SIZE = 132;

export type LocationGlobeProps = {
    /** the students whose cities are shown */
    students: Student[],
    /** starts the labels for the globe and the key */
    name: string,
    size?: number,
    /** the tallest the key may grow before it scrolls; it grows with the countries when nothing is given */
    maxKeyHeight?: number
};

export const LocationGlobe: React.FC<LocationGlobeProps> = ({ students, name, size = DEFAULT_GLOBE_SIZE, maxKeyHeight }) => {
    const countries = useMemo(() => countriesOf(students.map(student => ({ student }) as Placement)), [students]);

    // one dot for each distinct city, in the color of its country
    const places = useMemo(
        () => students.map(student => ({ city: student.city, state: student.state, country: student.country }) as Place),
        [students]);
    const { coordinates, missing, loading } = usePlaceCoordinates(places);
    const points: GlobePoint[] = useMemo(() => {
        const byKey = new Map<string, GlobePoint>();
        places.forEach(place => {
            const key = placeKey(place);
            const at = coordinates.get(key);
            if (at && !byKey.has(key)) {
                const country = countries.find(c => normalizeCountryName(c) === normalizeCountryName(place.country ?? '')) ?? place.country ?? '';
                byKey.set(key, {
                    id: key,
                    lat: at.lat,
                    lng: at.lng,
                    color: globeColor(country, countries),
                    label: [place.city?.trim(), place.country?.trim()].filter(Boolean).join(', ')
                });
            }
        });
        return Array.from(byKey.values());
    }, [places, coordinates, countries]);
    const countryCounts = countries.map(country => ({
        country,
        count: students.filter(student => normalizeCountryName(student.country ?? '') === normalizeCountryName(country)).length
    }));

    return (
        <Stack direction="row" alignItems="flex-start" flexWrap="wrap" columnGap={2} rowGap={1}>
            <Globe size={size} label={`${name} cities`} points={points} />
            <Box
                data-part="legend"
                sx={{
                    bgcolor: '#fff', color: 'text.primary', borderRadius: 1, px: 1.25, py: 1, minWidth: 0,
                    ...(maxKeyHeight !== undefined && { maxHeight: maxKeyHeight, overflowY: 'auto' })
                }}>
                <Box component="ul" aria-label={`${name} countries`} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                    {countryCounts.map(({ country, count }) =>
                        <Box component="li" key={country} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.125 }}>
                            <Box aria-hidden="true" sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, bgcolor: globeColor(country, countries), border: `1px solid ${GLOBE_DOT_EDGE}` }} />
                            <Typography variant="body2" noWrap>{country} <strong>{count}</strong></Typography>
                        </Box>
                    )}
                </Box>
                {(loading || missing > 0) &&
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {loading ? UI_STRINGS.LOADING_PLACES : `${missing} ${missing === 1 ? 'city' : 'cities'} ${UI_STRINGS.CITIES_NOT_PLACED}`}
                    </Typography>}
            </Box>
        </Stack>
    );
};
