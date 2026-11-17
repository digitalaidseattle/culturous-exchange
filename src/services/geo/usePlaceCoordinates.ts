/**
 *  usePlaceCoordinates.ts
 *
 *  The coordinates of a list of places, as they come in. Places already known are there at once;
 *  the rest are looked up a few at a time, and the result updates as each arrives.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useMemo, useState } from "react";
import { Coordinates, Place, geocodePlace, isNotFound, knownCoordinates, placeKey } from "./cityCoordinates";

const AT_ONCE = 4;

export type PlaceCoordinates = {
    /** the places that have been found, by placeKey */
    coordinates: Map<string, Coordinates>;
    /** how many of the places have no coordinates, because they were not found or could not be looked up */
    missing: number;
    loading: boolean;
};

export function usePlaceCoordinates(places: Place[]): PlaceCoordinates {
    // one entry for each distinct place, however many students are from it
    const distinct = useMemo(() => {
        const byKey = new Map<string, Place>();
        places.forEach(place => {
            if (place.city && !byKey.has(placeKey(place))) {
                byKey.set(placeKey(place), place);
            }
        });
        return byKey;
    }, [places]);
    const signature = Array.from(distinct.keys()).sort().join('|');

    // bumped each time a lookup finishes, so the result is read again
    const [, setVersion] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const waiting = Array.from(distinct.values()).filter(place => !knownCoordinates(place) && !isNotFound(place));
        if (waiting.length === 0) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        let running = 0;
        let next = 0;
        setLoading(true);

        const startMore = () => {
            while (!cancelled && running < AT_ONCE && next < waiting.length) {
                const place = waiting[next++];
                running++;
                geocodePlace(place)
                    .catch(() => null)
                    .then(() => {
                        running--;
                        if (!cancelled) {
                            setVersion(version => version + 1);
                            if (running === 0 && next >= waiting.length) {
                                setLoading(false);
                            } else {
                                startMore();
                            }
                        }
                    });
            }
        };
        startMore();
        return () => { cancelled = true; };
        // distinct is rebuilt on every render of a caller that makes a new list; the signature says whether it really changed
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);

    const coordinates = new Map<string, Coordinates>();
    distinct.forEach((place, key) => {
        const known = knownCoordinates(place);
        if (known) {
            coordinates.set(key, known);
        }
    });
    return { coordinates, missing: distinct.size - coordinates.size, loading };
}
