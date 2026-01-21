import { Student, ValidationError } from "./types";
import {
  MIN_NAME_LENGTH,
  MIN_CITY_LENGTH,
  MIN_STUDENT_AGE,
  MAX_STUDENT_AGE,
  MIN_COUNTRY_LENGTH,
  UI_STRINGS,
} from '../constants';

export interface Validator<T> {
  validate(data: T): ValidationError[];
}

export class NameValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.name.trim().length < MIN_NAME_LENGTH) {
      return [{ isValid: false, field: 'name', message: `${UI_STRINGS.NAME_AT_LEAST} ${MIN_NAME_LENGTH} ${UI_STRINGS.CHARACTERS}` }]
    }
    return []
  }
}

const EMAIL_REGEX = new RegExp('^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9]+)+$');
export class EmailValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (!student.email || !EMAIL_REGEX.test(student.email)) {
      return [{ isValid: false, field: 'email', message: UI_STRINGS.INVALID_EMAIL_FORMAT }]
    }
    return []
  }
}

export class CityValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.city!.trim().length < MIN_CITY_LENGTH) {
      return [{ isValid: false, field: 'city', message: UI_STRINGS.CITY_REQUIRED }]
    }
    return []
  }
}

export class AgeValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (!student.age) {
      return [{ isValid: false, field: 'age', message: UI_STRINGS.STUDENT_AGE_REQUIRED }]
    }
    if (student.age && (student.age < MIN_STUDENT_AGE || student.age > MAX_STUDENT_AGE)) {
      return [{ isValid: false, field: 'age', message: `${UI_STRINGS.AGE_MUST_BETWEEN_PREFIX} ${MIN_STUDENT_AGE} and ${MAX_STUDENT_AGE}.` }]
    }
    return []
  }
}

export class CountryValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.country.trim().length < MIN_COUNTRY_LENGTH) {
      return [{ isValid: false, field: 'country', message: UI_STRINGS.COUNTRY_REQUIRED }]
    }
    return []
  }
}

const VALID_DAYS = ['Friday', 'Saturday', 'Sunday'];
const VALID_TIME_WINDOW_REGEX = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$');
export class TimeWindowValidator implements Validator<Student> {

  validate(student: Student): ValidationError[] {
    const timeWindowErrors: ValidationError[] = [];

    if (!student.timeWindows || student.timeWindows.length === 0) {
      timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: UI_STRINGS.TIME_WINDOW_REQUIRED });
    }

    for (const tw of student.timeWindows!) {
      if (!tw.day_in_week || !VALID_DAYS.includes(tw.day_in_week.trim())) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: UI_STRINGS.DAY_OF_WEEK_MUST_BE });
      }
      if (!tw.start_t || !VALID_TIME_WINDOW_REGEX.test(tw.start_t)) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: UI_STRINGS.START_TIME_INVALID });
      }
      if (!tw.end_t || !VALID_TIME_WINDOW_REGEX.test(tw.end_t)) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: UI_STRINGS.END_TIME_INVALID });
      }
    }
    return timeWindowErrors;
  }
}

export class SpeadsheetValidationService {
  validators = [
    new NameValidator(),
    new AgeValidator(),
    new EmailValidator(),
    new CityValidator(),
    new CountryValidator(),
    new TimeWindowValidator()
  ];

  validateStudent(student: Student): ValidationError[] {
    return this.validators.map(validator => validator.validate(student)).flat()
  }
}

const studentValidationService = new SpeadsheetValidationService();
export { studentValidationService }