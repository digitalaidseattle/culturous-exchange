/**
 *  cityCoordinates.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cityName, clearCoordinateCache, geocodePlace, isNotFound, knownCoordinates, placeKey } from "./cityCoordinates";

const reply = (results: unknown[] | undefined, ok = true, status = 200) =>
    Promise.resolve({ ok, status, json: () => Promise.resolve({ results }) } as Response);

describe("cityName", () => {
    it.each([
        ["Lima", "Lima"],
        ["Mexico City ", "Mexico City"],
        ["Baghdad/ Al Ghazaliya", "Baghdad"],
        ["Terrassa(Barcelona)", "Terrassa"],
        ["Bekasi Regency, West Java.", "Bekasi Regency"],
        [undefined, ""]
    ])("%s is %s", (typed, name) => {
        expect(cityName(typed)).toBe(name);
    });
});

describe("placeKey", () => {
    it("is the same however the place was typed", () => {
        expect(placeKey({ city: "Lima ", country: "Perú" })).toBe(placeKey({ city: "lima", country: "Peru" }));
        expect(placeKey({ city: "PAKISTAN" })).toBe(placeKey({ city: "pakistan" }));
    });

    it("tells apart places with the same city in different countries or states", () => {
        expect(placeKey({ city: "Leon", country: "Mexico" })).not.toBe(placeKey({ city: "Leon", country: "Spain" }));
        expect(placeKey({ city: "Portland", state: "Oregon", country: "USA" })).not.toBe(placeKey({ city: "Portland", state: "Maine", country: "USA" }));
    });
});

describe("geocodePlace", () => {
    const fetchMock = vi.fn();
    // a plain stand-in: the test runtime's own localStorage is not always a complete one
    const storage = new Map<string, string>();
    beforeEach(() => {
        storage.clear();
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => { storage.set(key, value); },
            removeItem: (key: string) => { storage.delete(key); }
        });
        clearCoordinateCache();
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });
    afterEach(() => { vi.unstubAllGlobals(); });

    it("asks the service for the city, in its country, and returns where it is", async () => {
        fetchMock.mockReturnValue(reply([{ latitude: -12.04, longitude: -77.03, country_code: "PE" }]));
        const coordinates = await geocodePlace({ city: "Lima ", country: "Peru" });
        expect(coordinates).toEqual({ lat: -12.04, lng: -77.03 });
        const url = new URL(fetchMock.mock.calls[0][0]);
        expect(url.origin + url.pathname).toBe("https://geocoding-api.open-meteo.com/v1/search");
        expect(url.searchParams.get("name")).toBe("Lima");
        expect(url.searchParams.get("countryCode")).toBe("PE");
    });

    it("only sends the city, the country, and the settings of the request", async () => {
        fetchMock.mockReturnValue(reply([{ latitude: 1, longitude: 2 }]));
        await geocodePlace({ city: "Lima", state: "Lima Province", country: "Peru" });
        const url = new URL(fetchMock.mock.calls[0][0]);
        expect(Array.from(url.searchParams.keys()).sort()).toEqual(["count", "countryCode", "format", "language", "name"]);
    });

    it("remembers a place, so it is asked for once", async () => {
        fetchMock.mockReturnValue(reply([{ latitude: 1, longitude: 2 }]));
        await geocodePlace({ city: "Lima", country: "Peru" });
        await geocodePlace({ city: "lima ", country: "Perú" });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(knownCoordinates({ city: "Lima", country: "Peru" })).toEqual({ lat: 1, lng: 2 });
    });

    it("remembers places in this browser, for next time", async () => {
        fetchMock.mockReturnValue(reply([{ latitude: 1, longitude: 2 }]));
        await geocodePlace({ city: "Lima", country: "Peru" });
        const stored = JSON.parse(storage.get("ce.cityCoordinates.v1")!);
        expect(Object.values(stored)).toEqual([[1, 2]]);
    });

    it("uses the state to choose among cities of the same name", async () => {
        fetchMock.mockReturnValue(reply([
            { latitude: 1, longitude: 1, admin1: "Leon" },
            { latitude: 21.1, longitude: -101.7, admin1: "Guanajuato" }
        ]));
        expect(await geocodePlace({ city: "Leon", state: "Guanajuato", country: "Mexico" })).toEqual({ lat: 21.1, lng: -101.7 });
    });

    it("takes the service's first match when there is no state", async () => {
        fetchMock.mockReturnValue(reply([{ latitude: 5, longitude: 6 }, { latitude: 7, longitude: 8 }]));
        expect(await geocodePlace({ city: "Springfield", country: "USA" })).toEqual({ lat: 5, lng: 6 });
    });

    it("is null for a place the service does not know, and does not ask again", async () => {
        fetchMock.mockReturnValue(reply(undefined));
        expect(await geocodePlace({ city: "Nowhereville", country: "Peru" })).toBeNull();
        expect(isNotFound({ city: "Nowhereville", country: "Peru" })).toBe(true);
        expect(await geocodePlace({ city: "Nowhereville", country: "Peru" })).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("is null, without a request, when there is no city", async () => {
        expect(await geocodePlace({ city: "  ", country: "Peru" })).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("fails, and tries again next time, when the service cannot be reached", async () => {
        fetchMock.mockReturnValueOnce(reply(undefined, false, 503));
        await expect(geocodePlace({ city: "Lima", country: "Peru" })).rejects.toThrow("503");
        expect(isNotFound({ city: "Lima", country: "Peru" })).toBe(false);
        fetchMock.mockReturnValueOnce(reply([{ latitude: 1, longitude: 2 }]));
        expect(await geocodePlace({ city: "Lima", country: "Peru" })).toEqual({ lat: 1, lng: 2 });
    });
});
