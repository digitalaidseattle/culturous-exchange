import { Student, ValidationError } from "./types";

export interface Validator<T> {
  validate(data: T): ValidationError[];
}

const MIN_NAME_LENGTH = 4;
export class NameValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.name.trim().length < MIN_NAME_LENGTH) {
      return [{ isValid: false, field: 'name', message: `Name must be at least ${MIN_NAME_LENGTH} characters` }]
    }
    return []
  }
}

const EMAIL_REGEX = new RegExp('^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9]+)+$');
export class EmailValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (!student.email || !EMAIL_REGEX.test(student.email)) {
      return [{ isValid: false, field: 'email', message: 'Invalid email format' }]
    }
    return []
  }
}

const MIN_CITY_LENGTH = 1;
export class CityValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.city!.trim().length < MIN_CITY_LENGTH) {
      return [{ isValid: false, field: 'city', message: 'City is required' }]
    }
    return []
  }
}

const MIN_STUDENT_AGE = 13;
const MAX_STUDENT_AGE = 19;
export class AgeValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (!student.age) {
      return [{ isValid: false, field: 'age', message: 'Student age is required.' }]
    }
    if (student.age && (student.age < MIN_STUDENT_AGE || student.age > MAX_STUDENT_AGE)) {
      return [{ isValid: false, field: 'age', message: `Age must between ${MIN_STUDENT_AGE} and ${MAX_STUDENT_AGE}.` }]
    }
    return []
  }
}

const MIN_COUNTRY_LENGTH = 1;
export class CountryValidator implements Validator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.country.trim().length < MIN_COUNTRY_LENGTH) {
      return [{ isValid: false, field: 'country', message: 'Country is required' }]
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
      timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `A time window is required.` });
    }

    for (const tw of student.timeWindows!) {
      if (!tw.day_in_week || !VALID_DAYS.includes(tw.day_in_week.trim())) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Day of week must be "Friday", "Saturday", or "Sunday"` });
      }
      if (!tw.start_t || !VALID_TIME_WINDOW_REGEX.test(tw.start_t)) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Start time invalid` });
      }
      if (!tw.end_t || !VALID_TIME_WINDOW_REGEX.test(tw.end_t)) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `End time invalid` });
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