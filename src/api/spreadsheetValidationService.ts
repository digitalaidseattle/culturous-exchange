// import { Student, TimeWindow, ValidationError } from "./types";
import { Student, ValidationError } from "./types";

type ValidationResult = {}

interface Validator<T> {
  valdiate(data: T): ValidationError[];
}

class NameValidator implements Validator<Student> {
  minLength = 3;
  valdiate(student: Student): ValidationError[] {
    if (student.name.trim().length <= this.minLength) {
      return [{ isValid: false, field: 'name', message: 'Name must be at least four characters' }]
    }
    return [{ isValid: true }]
  }
}

class EmailValidator implements Validator<Student> {
  regExp = new RegExp('^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9]+)+$');
  valdiate(student: Student): ValidationError[] {
    if (!student.email || !this.regExp.test(student.email)) {
      return [{ isValid: false, field: 'email', message: 'Invalid email format' }]
    }
    return [{ isValid: true }]
  }
}

class


export class SpeadsheetValidationService {


  validateCity(city: string | undefined): null | ValidationError {
    if (city!.trim().length <= 2) {
      return { isValid: false, field: 'city', message: 'City is required' }
    }
    return null;
  }

  validateCountry(country: string): null | ValidationError {
    if (country.trim().length <= 2) {
      return { isValid: false, field: 'country', message: 'Country is required' }
    }
    return null;
  }

  validateTimeWindows(timeWindows: Partial<TimeWindow>[]): null | ValidationError[] {
    const timeWindowErrors: ValidationError[] = [];
    //FIXME: uncomment when timeWindows is required
  //  if (timeWindows && !timeWindows.length) {
  //   timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: 'Must include time window availabilities' });
  //  }

   const validDays = ['Friday', 'Saturday', 'Sunday'];
   const validTimeFormatRegExp = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$')

   for (const tw of timeWindows) {
    if (!tw.day_in_week || !validDays.includes(tw.day_in_week.trim())) {
      timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Day of week must be 'Friday', 'Saturday', or 'Sunday'` });
    }
    if (!tw.start_t || !validTimeFormatRegExp.test(tw.start_t)) {
      timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Start time invalid` });
    }
    if (!tw.end_t || !validTimeFormatRegExp.test(tw.end_t)) {
      timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `End time invalid` });
    }
    //add more check here if desired: start date < end date, etc.
   }

   return timeWindowErrors.length ? timeWindowErrors : null;
  }

  validateStudent(student: Student): Partial<ValidationError>[] {
    //validateStudent assembles error messages and return an array of all error, with a field and message
    const validaitonErrors: Partial<ValidationError>[] = [];

    const nameError = this.validateName(student.name);
    if (nameError) {
      validaitonErrors.push({ field: nameError.field, message: nameError.message });
    }
    const emailError = this.validateEmail(student.email);
    if (emailError) {
      validaitonErrors.push({ field: emailError.field, message: emailError.message });
    }
    const cityError = this.validateCity(student.city);
    if (cityError) {
      validaitonErrors.push({ field: cityError.field, message: cityError.message });
    }
    const countryError = this.validateCountry(student.country);
    if (countryError) {
      validaitonErrors.push({ field: countryError.field, message: countryError.message });
    }
    if (student.timeWindows) {
      const timeWindowErrors = this.validateTimeWindows(student.timeWindows)
      if (timeWindowErrors) {
        validaitonErrors.push(...timeWindowErrors);
      }
    }
    return validaitonErrors;
  }

}