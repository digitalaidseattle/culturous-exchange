/**
 *  cityCoordinates.ts
 *
 *  Finds where a student's city is on the globe, for the dots on the globes of the groups page.
 *
 *  Students are stored with a city, a state and a country but no coordinates, so each distinct
 *  place is looked up once, with the free Open-Meteo geocoding service (no key, and open for
 *  browsers to call), and remembered in this browser, so a place is not asked for twice. Only
 *  the city, state and country text is sent. A place that is not found, or cannot be looked up
 *  just now, gets no dot.
 *
 *  Saving coordinates with each student when they are uploaded would make this lookup, and the
 *  call to an outside service from the browser, unnecessary. That needs new columns in the
 *  student table.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { countryCode, normalizeCountryName } from "../../utils/countryFlag";

export type Place = { city?: string | null, state?: string | null, country?: string | null };
export type Coordinates = { lat: number, lng: number };

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const STORAGE_KEY = 'ce.cityCoordinates.v1';

/** Places found this session, and places that were looked up and not found. */
const found = new Map<string, Coordinates>();
const notFound = new Set<string>();
let storageLoaded = false;

/** The city without what people add after it: "Baghdad/ Al Ghazaliya", "Terrassa(Barcelona)". */
export function cityName(city: string | null | undefined): string {
    return (city ?? '').split(/[,/(]/)[0].replace(/\.$/, '').trim();
}

/** The same key for the same place however it was typed: "Lima " and "lima" in "Perú" and "Peru". */
export function placeKey(place: Place): string {
    const country = place.country ?? '';
    return [
        normalizeCountryName(cityName(place.city)),
        normalizeCountryName(place.state ?? ''),
        countryCode(country) ?? normalizeCountryName(country)
    ].join('@');
}

function loadStorage() {
    if (storageLoaded) {
        return;
    }
    storageLoaded = true;
    try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, [number, number]>;
        Object.entries(stored).forEach(([key, [lat, lng]]) => found.set(key, { lat, lng }));
    } catch {
        // storage can be blocked or hold something else; the places are simply looked up again
    }
}

function saveStorage() {
    try {
        const stored: Record<string, [number, number]> = {};
        found.forEach(({ lat, lng }, key) => { stored[key] = [lat, lng]; });
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
        // see loadStorage
    }
}

/** Where the place is, if it has been looked up already; undefined when it has not been or was not found. */
export function knownCoordinates(place: Place): Coordinates | undefined {
    loadStorage();
    return found.get(placeKey(place));
}

/** Whether looking the place up came back with nothing, so it is not asked for again. */
export function isNotFound(place: Place): boolean {
    return notFound.has(placeKey(place));
}

/** Forgets every place, found or not. For tests. */
export function clearCoordinateCache() {
    found.clear();
    notFound.clear();
    storageLoaded = false;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // see loadStorage
    }
}

type GeocodeResult = { latitude: number, longitude: number, admin1?: string, country_code?: string };

/**
 * Looks the place up. Resolves to the coordinates, or null when the place is not known to the
 * service. Rejects when the service cannot be reached, so the place can be tried again later.
 */
export async function geocodePlace(place: Place): Promise<Coordinates | null> {
    const key = placeKey(place);
    const known = knownCoordinates(place);
    if (known) {
        return known;
    }
    if (notFound.has(key)) {
        return null;
    }
    const name = cityName(place.city);
    if (!name) {
        notFound.add(key);
        return null;
    }
    const params = new URLSearchParams({ name, count: '5', language: 'en', format: 'json' });
    const code = countryCode(place.country);
    if (code) {
        params.set('countryCode', code);
    }
    const response = await fetch(`${ENDPOINT}?${params}`);
    if (!response.ok) {
        throw new Error(`Place lookup failed (${response.status})`);
    }
    const results: GeocodeResult[] = (await response.json()).results ?? [];
    const state = normalizeCountryName(place.state ?? '');
    // the service puts the best known match first; a state, when there is one, picks among the matches
    const match = (state && results.find(result => normalizeCountryName(result.admin1 ?? '').includes(state))) || results[0];
    if (!match) {
        notFound.add(key);
        return null;
    }
    const coordinates = { lat: match.latitude, lng: match.longitude };
    found.set(key, coordinates);
    saveStorage();
    return coordinates;
}
