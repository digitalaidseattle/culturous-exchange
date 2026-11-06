/**
 *  countryFlag.ts
 *
 *  Turns a country name, as people type it, into a flag emoji.
 *
 *  Names are matched ignoring capital letters, accents, punctuation and a leading
 *  "the", so "PAKISTAN", "Perú" and "The Gambia" all work. The runtime's own list of
 *  English country names is used, plus the common alternate names people type
 *  (USA, UK, Turkey, Czech Republic, and so on). When the text holds more than a
 *  country, such as "Russia, but living in Germany", the country named first is used.
 *
 *  A flag emoji is two regional indicator letters. Some systems, notably Windows,
 *  draw those as the two letters instead of a picture of the flag.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */

/**
 * The official two-letter country codes (ISO 3166-1), plus XK for Kosovo, which is
 * widely used. Only these are looked up: the runtime also knows retired codes such as
 * "UK" and "SU" whose names would otherwise replace the real country.
 */
export const COUNTRY_CODES = (
    'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ '
    + 'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR '
    + 'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP '
    + 'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT '
    + 'MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW '
    + 'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG '
    + 'UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW XK'
).split(' ');

/** Shown when a country name is not recognized. */
export const UNKNOWN_COUNTRY_FLAG = '🌐';

// Names people use that differ from, or are missing in, the runtime's list.
// Keys are written already normalized (see normalize).
const ALIASES: Record<string, string> = {
    'usa': 'US', 'us': 'US', 'america': 'US', 'united states of america': 'US',
    'uk': 'GB', 'great britain': 'GB', 'britain': 'GB', 'england': 'GB', 'scotland': 'GB',
    'wales': 'GB', 'northern ireland': 'GB',
    'turkey': 'TR', 'turkiye': 'TR',
    'czech republic': 'CZ',
    'ivory coast': 'CI',
    'burma': 'MM', 'myanmar': 'MM',
    'south korea': 'KR', 'republic of korea': 'KR', 'korea': 'KR', 'north korea': 'KP',
    'russian federation': 'RU',
    'viet nam': 'VN',
    'uae': 'AE',
    'dr congo': 'CD', 'drc': 'CD', 'democratic republic of the congo': 'CD', 'congo kinshasa': 'CD',
    'republic of the congo': 'CG', 'congo brazzaville': 'CG',
    'palestine': 'PS', 'state of palestine': 'PS', 'palestinian territories': 'PS',
    'vatican': 'VA', 'holy see': 'VA',
    'swaziland': 'SZ', 'eswatini': 'SZ',
    'macedonia': 'MK', 'north macedonia': 'MK',
    'cape verde': 'CV', 'cabo verde': 'CV',
    'east timor': 'TL', 'timor leste': 'TL',
    'holland': 'NL',
    'hong kong': 'HK', 'macau': 'MO', 'macao': 'MO',
    'laos': 'LA', 'lao pdr': 'LA',
    'saint lucia': 'LC', 'saint kitts and nevis': 'KN', 'saint vincent and the grenadines': 'VC',
    'st vincent and the grenadines': 'VC',
    'micronesia': 'FM', 'brunei': 'BN'
};

/** Lowercase, no accents, no punctuation, single spaces, no leading "the". */
export function normalizeCountryName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/['’`".]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/^the /, '');
}

/** The flag emoji for a two-letter country code such as "US". */
export function flagEmoji(code: string): string {
    return Array.from(code.toUpperCase())
        .map(letter => String.fromCodePoint(0x1F1E6 + letter.charCodeAt(0) - 'A'.charCodeAt(0)))
        .join('');
}

let namesToCodes: Map<string, string> | undefined;

function lookupTable(): Map<string, string> {
    if (namesToCodes) {
        return namesToCodes;
    }
    const table = new Map<string, string>();
    // the runtime's English name for each country code
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
        const names = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });
        for (const code of COUNTRY_CODES) {
            const name = names.of(code);
            if (name) {
                table.set(normalizeCountryName(name), code);
                // "Myanmar (Burma)" can also be found as "Myanmar" and as "Burma"
                const outside = name.replace(/\s*\(.*\)/, '');
                const inside = name.match(/\(([^)]*)\)/)?.[1];
                table.set(normalizeCountryName(outside), code);
                if (inside) {
                    table.set(normalizeCountryName(inside), code);
                }
            }
        }
    }
    Object.entries(ALIASES).forEach(([name, code]) => table.set(name, code));
    namesToCodes = table;
    return table;
}

/** The text before the first comma, slash, semicolon, bracket, dash, "but" or "and". */
function firstPart(text: string): string {
    return text.split(/\s*(?:[,/;(]|\s-\s|\sbut\s|\sand\s)/i)[0];
}

/** The two-letter country code for a country name, or undefined when the country is not recognized. */
export function countryCode(country: string | null | undefined): string | undefined {
    if (!country) {
        return undefined;
    }
    const table = lookupTable();
    for (const candidate of [country, firstPart(country)]) {
        const code = table.get(normalizeCountryName(candidate));
        if (code) {
            return code;
        }
    }
    return undefined;
}

/** The flag emoji for a country name, or undefined when the country is not recognized. */
export function countryFlag(country: string | null | undefined): string | undefined {
    const code = countryCode(country);
    return code ? flagEmoji(code) : undefined;
}
