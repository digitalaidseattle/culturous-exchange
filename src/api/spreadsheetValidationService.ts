import { Student, ValidationError } from "./types";

export interface Validator<T> {
  validate(data: T): ValidationError[];
}

export class NameValidator implements Validator<Student> {
  minLength = 3;
  validate(student: Student): ValidationError[] {
    if (student.name.trim().length <= this.minLength) {
      return [{ isValid: false, field: 'name', message: 'Name must be at least four characters' }]
    }
    return []
  }
}

export class EmailValidator implements Validator<Student> {
  regExp = new RegExp('^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9]+)+$');
  validate(student: Student): ValidationError[] {
    if (!student.email || !this.regExp.test(student.email)) {
      return [{ isValid: false, field: 'email', message: 'Invalid email format' }]
    }
    return []
  }
}

const MIN_CITY_LENGTH = 1;
export class CityValidator implements Validator<Student> {
  minlength = 1;
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

export class TimeWindowValidator implements Validator<Student> {
  validDays: string[] = ['Friday', 'Saturday', 'Sunday'];
  validTimeFormatRegExp: RegExp = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$')

  validate(student: Student): ValidationError[] {
    const timeWindowErrors: ValidationError[] = [];

    for (const tw of student.timeWindows!) {
      if (!tw.day_in_week || !this.validDays.includes(tw.day_in_week.trim())) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Day of week must be "Friday", "Saturday", or "Sunday"` });
      }
      if (!tw.start_t || !this.validTimeFormatRegExp.test(tw.start_t)) {
        timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Start time invalid` });
      }
      if (!tw.end_t || !this.validTimeFormatRegExp.test(tw.end_t)) {
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

