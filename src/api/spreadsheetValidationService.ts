import { Student, TimeWindow } from "./types";

type Errors = {
  [key: string]: string[]
}

export class SpeadsheetValidationService {

  validateName(name: string): boolean {
    return name.trim().length >= 4;
  }

  validateEmail(email: string): boolean {
    if (!email) return false;
    const regExp = new RegExp('^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9]+)+$');
    return regExp.test(email);
  }

  validateCity(city: string | undefined): boolean {
    if (!city) return false;
    return city.trim().length > 0;
  }

  validateCountry(country: string): boolean {
    if (!country) return false;
    return country.trim().length > 0;
  }

  //may want specific errormessages made and return those
  validateTimeWindows(timeWindows: Partial<TimeWindow>[]): boolean {
    //uncomment when timeWindows is required
   if (timeWindows && !timeWindows.length) return false;

   const validDays = ['Friday, Saturday, Sunday'];
   const validTimeFormatRegExp = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$')

   for (const tw of timeWindows) {
    if (!tw.day_in_week || !validDays.includes(tw.day_in_week.trim())) {
      return false;
    }
    if (!tw.start_t || !validTimeFormatRegExp.test(tw.start_t)) {
      return false;
    }
    if (!tw.end_t || !validTimeFormatRegExp.test(tw.end_t)) {
      return false;
    }
    //add more check here if desired: start date < end date, etc.
   }

   return true;
  }

  validateStudent(student: Student): Errors {
    //in using an array to hold multiple errors if needed later
    const errors: { [key: string]: string[] } = {};
    if (!this.validateName(student.name)) {
      errors['name'] = [...errors['name'], 'Name must be at least four characters'];
    }
    if (!this.validateEmail(student.email)) {
      errors['email'] = ['Invalid email format'];
    }
    if (!this.validateCity(student.city)) {
      errors['city'] = ['City is required'];
    }
    if (!this.validateCountry(student.country)) {
      errors['country'] = ['Country is required'];
    }
    if (student.timeWindows && !this.validateTimeWindows(student.timeWindows!)) {
      errors['timeWindows'] = ['TimeWindows contain invalid format']
    }
    return errors

  }

}