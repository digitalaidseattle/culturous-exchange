import { Student, ValidationError } from "./types";


interface FieldValidator<T> {
  validate(data: T): ValidationError[];
}

class NameValidator implements FieldValidator<Student> {
  minLength = 3;

  validate(student: Student): ValidationError[] {
    if (student.name.trim().length <= this.minLength) {
      return [{ isValid: false, field: 'name', message: 'Name must be at least four characters' }]
    }
    return [];
  }
}

class EmailValidator implements FieldValidator<Student> {
  regExp = new RegExp('^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9]+)+$');

  validate(student: Student): ValidationError[] {
    if (!student.email || !this.regExp.test(student.email)) {
      return [{ isValid: false, field: 'email', message: 'Invalid email format' }]
    }
    return [];
  }
}

class CityValidator implements FieldValidator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.city?.trim().length === 0) {
      return [{ isValid: false, field: 'city', message: 'City is required' }]
    }
    return [];
  }
}

class CountryValidator implements FieldValidator<Student> {
  validate(student: Student): ValidationError[] {
    if (student.country.trim().length === 0) {
      return [{ isValid: false, field: 'country', message: 'Country is required' }]
    }
    return [];
  }
}

class TimeWindowValidator implements FieldValidator<Student> {
  validate(student: Student): ValidationError[] {
    const timeWindowErrors: ValidationError[] = [];
    //FIXME: uncomment when timeWindows is required
    //  if (timeWindows && !timeWindows.length) {
    //   timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: 'Must include time window availabilities' });
    //  }

    const validDays = ['Friday', 'Saturday', 'Sunday'];
    const validTimeFormatRegExp = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$')

    for (const tw of student.timeWindows!) {
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

    return timeWindowErrors;
  }
}

export class SpeadsheetValidationService {
  validators = [
    new NameValidator(),
    new EmailValidator(),
    new CityValidator(),
    new CountryValidator(),
    new TimeWindowValidator()
  ];

  validateStudent(student: Student): Partial<ValidationError>[] {
    //validateStudent assembles error messages and return an array of all error, with a field and message
    return this.validators
      .map(validator => validator.validate(student))
      .flat();
  }

}