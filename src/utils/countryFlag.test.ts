/**
 *  countryFlag.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it } from "vitest";

import { COUNTRY_CODES, countryFlag, flagEmoji, normalizeCountryName } from "./countryFlag";

describe("flagEmoji", () => {
    it("builds a flag from two regional indicator letters", () => {
        expect(flagEmoji("US")).toBe("\u{1F1FA}\u{1F1F8}");
        expect(flagEmoji("br")).toBe("\u{1F1E7}\u{1F1F7}");
    });
});

describe("COUNTRY_CODES", () => {
    it("lists 249 official codes plus Kosovo, each once", () => {
        expect(COUNTRY_CODES).toHaveLength(250);
        expect(new Set(COUNTRY_CODES).size).toBe(250);
        COUNTRY_CODES.forEach(code => expect(code).toMatch(/^[A-Z]{2}$/));
    });

    it("has an English name for every code, so none is a typo", () => {
        const names = new Intl.DisplayNames(["en"], { type: "region", fallback: "none" });
        COUNTRY_CODES.forEach(code => expect(names.of(code), code).toBeTruthy());
    });

    it("leaves out retired codes", () => {
        expect(COUNTRY_CODES).not.toContain("UK");
        expect(COUNTRY_CODES).not.toContain("SU");
        expect(COUNTRY_CODES).not.toContain("ZZ");
    });
});

describe("normalizeCountryName", () => {
    it("ignores case, accents, punctuation, extra spaces, and a leading 'the'", () => {
        expect(normalizeCountryName("  PERÚ ")).toBe("peru");
        expect(normalizeCountryName("The Gambia")).toBe("gambia");
        expect(normalizeCountryName("U.S.A.")).toBe("usa");
        expect(normalizeCountryName("Côte d’Ivoire")).toBe("cote divoire");
        expect(normalizeCountryName("Bosnia & Herzegovina")).toBe("bosnia and herzegovina");
    });
});

describe("countryFlag", () => {
    const flag = (code: string) => flagEmoji(code);

    it("finds countries by their English names", () => {
        expect(countryFlag("United States")).toBe(flag("US"));
        expect(countryFlag("Brazil")).toBe(flag("BR"));
        expect(countryFlag("Philippines")).toBe(flag("PH"));
        expect(countryFlag("Bangladesh")).toBe(flag("BD"));
        expect(countryFlag("Vietnam")).toBe(flag("VN"));
        expect(countryFlag("Germany")).toBe(flag("DE"));
        expect(countryFlag("Kenya")).toBe(flag("KE"));
    });

    it("ignores capital letters, accents, and spaces around the name", () => {
        expect(countryFlag("PAKISTAN")).toBe(flag("PK"));
        expect(countryFlag("Perú")).toBe(flag("PE"));
        expect(countryFlag("Afghanistan ")).toBe(flag("AF"));
        expect(countryFlag("  mexico")).toBe(flag("MX"));
    });

    it("finds the common alternate names", () => {
        expect(countryFlag("USA")).toBe(flag("US"));
        expect(countryFlag("U.S.A.")).toBe(flag("US"));
        expect(countryFlag("United States of America")).toBe(flag("US"));
        expect(countryFlag("UK")).toBe(flag("GB"));
        expect(countryFlag("United Kingdom")).toBe(flag("GB"));
        expect(countryFlag("Turkey")).toBe(flag("TR"));
        expect(countryFlag("Türkiye")).toBe(flag("TR"));
        expect(countryFlag("Czech Republic")).toBe(flag("CZ"));
        expect(countryFlag("Czechia")).toBe(flag("CZ"));
        expect(countryFlag("Ivory Coast")).toBe(flag("CI"));
        expect(countryFlag("Côte d'Ivoire")).toBe(flag("CI"));
        expect(countryFlag("South Korea")).toBe(flag("KR"));
        expect(countryFlag("Myanmar")).toBe(flag("MM"));
        expect(countryFlag("Burma")).toBe(flag("MM"));
        expect(countryFlag("The Gambia")).toBe(flag("GM"));
        expect(countryFlag("Holland")).toBe(flag("NL"));
        expect(countryFlag("UAE")).toBe(flag("AE"));
        expect(countryFlag("Russia")).toBe(flag("RU"));
        expect(countryFlag("Iran")).toBe(flag("IR"));
    });

    it("uses the country named first when there is more text", () => {
        expect(countryFlag("Russia, but living in Germany")).toBe(flag("RU"));
        expect(countryFlag("Spain / USA (exchange student)")).toBe(flag("ES"));
        expect(countryFlag("India (Delhi)")).toBe(flag("IN"));
    });

    it("does not take a country apart when its own name has 'and' or a dash in it", () => {
        expect(countryFlag("Trinidad and Tobago")).toBe(flag("TT"));
        expect(countryFlag("Bosnia & Herzegovina")).toBe(flag("BA"));
        expect(countryFlag("Antigua and Barbuda")).toBe(flag("AG"));
    });

    it("returns nothing for names it does not know", () => {
        expect(countryFlag("Narnia")).toBeUndefined();
        expect(countryFlag("")).toBeUndefined();
        expect(countryFlag("   ")).toBeUndefined();
        expect(countryFlag(undefined)).toBeUndefined();
        expect(countryFlag(null)).toBeUndefined();
    });

    it("does not treat the unknown-region placeholder or a two-letter guess as a country", () => {
        expect(countryFlag("Unknown Region")).toBeUndefined();
        expect(countryFlag("ZZ")).toBeUndefined();
    });
});
