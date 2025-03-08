import { Country, TimeZone, CountryTimeZone } from "./types";
const countriesJson = require('./countries.json');
const timeZonesJson = require('./timeZones.json')

class ceTimeZoneService {
  private countries: Country[] = [];
  private timeZoneMap: Record<string, TimeZone[]> = {};

  async loadCountries(): Promise<void> {
    //automatically parsed on require here, but will need parsing when using actual API
    this.countries = countriesJson;
  }

  async loadTimeZones(): Promise<void> {
    this.timeZoneMap = timeZonesJson.reduce((acc: Record<string, TimeZone[]>, curr: CountryTimeZone) => {
      acc[curr.countryCode] = curr.timeZones;
      return acc;
    }, {})
  }

  getCountries(): Country[] {
    return this.countries;
  }

  getTimeZoneByCountry(countryCode: string): TimeZone[] {
    return this.timeZoneMap[countryCode];
  }
}

const timeZoneService = new ceTimeZoneService;
export default timeZoneService;
