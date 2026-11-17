/**
 *  usePlaceCoordinates.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearCoordinateCache, Place } from "./cityCoordinates";
import { usePlaceCoordinates } from "./usePlaceCoordinates";

const fetchMock = vi.fn();
const answer = (latitude: number, longitude: number) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ results: [{ latitude, longitude }] }) } as Response);

const Probe = ({ places }: { places: Place[] }) => {
    const { coordinates, missing, loading } = usePlaceCoordinates(places);
    return <div data-testid="out">{`${coordinates.size} found, ${missing} missing, ${loading ? "loading" : "done"}`}</div>;
};
const out = () => screen.getByTestId("out").textContent;

describe("usePlaceCoordinates", () => {
    beforeEach(() => {
        clearCoordinateCache();
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });
    afterEach(() => { vi.unstubAllGlobals(); });

    it("looks each distinct place up once, however many students are from it", async () => {
        fetchMock.mockImplementation(() => answer(1, 2));
        render(<Probe places={[{ city: "Lima", country: "Peru" }, { city: "Lima ", country: "Perú" }, { city: "Cairo", country: "Egypt" }]} />);
        await waitFor(() => expect(out()).toBe("2 found, 0 missing, done"));
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("counts the places that were not found as missing", async () => {
        fetchMock.mockImplementation((url: string) => String(url).includes("Atlantis")
            ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) } as Response)
            : answer(1, 2));
        render(<Probe places={[{ city: "Lima", country: "Peru" }, { city: "Atlantis", country: "Peru" }]} />);
        await waitFor(() => expect(out()).toBe("1 found, 1 missing, done"));
    });

    it("counts the places it could not reach the service for as missing, without failing", async () => {
        fetchMock.mockReturnValue(Promise.reject(new Error("offline")));
        render(<Probe places={[{ city: "Lima", country: "Peru" }]} />);
        await waitFor(() => expect(out()).toBe("0 found, 1 missing, done"));
    });

    it("has places it already knows at once, with no request", async () => {
        fetchMock.mockImplementation(() => answer(1, 2));
        const places = [{ city: "Lima", country: "Peru" }];
        const first = render(<Probe places={places} />);
        await waitFor(() => expect(out()).toBe("1 found, 0 missing, done"));
        first.unmount();
        fetchMock.mockClear();
        render(<Probe places={places} />);
        expect(out()).toBe("1 found, 0 missing, done");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("ignores students with no city", () => {
        render(<Probe places={[{ city: "", country: "Peru" }, { city: null, country: "Peru" }]} />);
        expect(out()).toBe("0 found, 0 missing, done");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("never has more than four requests going at once", async () => {
        let going = 0;
        let most = 0;
        fetchMock.mockImplementation(async () => {
            going++;
            most = Math.max(most, going);
            await new Promise(resolve => setTimeout(resolve, 5));
            going--;
            return { ok: true, status: 200, json: () => Promise.resolve({ results: [{ latitude: 1, longitude: 2 }] }) } as Response;
        });
        render(<Probe places={Array.from({ length: 10 }, (_, i) => ({ city: `City${i}`, country: "Peru" }))} />);
        await waitFor(() => expect(out()).toBe("10 found, 0 missing, done"));
        expect(most).toBeLessThanOrEqual(4);
    });
});
