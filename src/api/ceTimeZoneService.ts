import { Country, TimeZone, CountryTimeZone } from "./types";

//automatically parsed on require below, but will need parsing when using actual API
import countriesJson from '../assets/countries.json';
import timeZonesJson from '../assets/timeZones.json';

class ceTimeZoneService {
  private countries: Country[] = [];
  private timeZoneMap: Record<string, TimeZone[]> = {};

  async loadCountries(): Promise<void> {
    this.countries = countriesJson;
  }

  async loadTimeZones(): Promise<void> {
    this.timeZoneMap = timeZonesJson.reduce((acc: Record<string, TimeZone[]>, curr: CountryTimeZone) => {
      acc[curr.countryCode] = curr.timeZones;
      return acc;
    }, {})
  }

  getCountries(): Country[] {
    console.log('whoops!!')
    return this.countries;
  }

  getTimeZoneByCountry(countryCode: string): TimeZone[] {
    return this.timeZoneMap[countryCode];
  }
}

const timeZoneService = new ceTimeZoneService;
export default timeZoneService;
