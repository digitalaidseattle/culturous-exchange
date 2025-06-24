import { Student, ValidationError } from "./types";

interface Validator<T> {
  valdiate(data: T): ValidationError[];
}

class NameValidator implements Validator<Student> {
  minLength = 3;
  valdiate(student: Student): ValidationError[] {
    if (student.name.trim().length <= this.minLength) {
      return [{ isValid: false, field: 'name', message: 'Name must be at least four characters' }]
    }
    return []
  }
}

class EmailValidator implements Validator<Student> {
  regExp = new RegExp('^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9]+)+$');
  valdiate(student: Student): ValidationError[] {
    if (!student.email || !this.regExp.test(student.email)) {
      return [{ isValid: false, field: 'email', message: 'Invalid email format' }]
    }
    return []
  }
}

class CityValidator implements Validator<Student> {
  minlength = 2;
  valdiate(student: Student): ValidationError[] {
    if (student.city!.trim().length <= this.minlength) {
      return [{ isValid: false, field: 'city', message: 'City is required' }]
    }
    return []
  }
}
class CountryValidator implements Validator<Student> {
  minlength = 2;
  valdiate(student: Student): ValidationError[] {
    if (student.country.trim().length <= this.minlength) {
      return [{ isValid: false, field: 'country', message: 'Country is required' }]
    }
    return []
  }
}

class TimeWindowValidator implements Validator<Student> {
  timeWindowErrors: ValidationError[] = [];
  validDays: string[] = ['Friday', 'Saturday', 'Sunday'];
  validTimeFormatRegExp: RegExp = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$')

  valdiate(student: Student): ValidationError[] {
    for (const tw of student.timeWindows!) {
      if (!tw.day_in_week || !this.validDays.includes(tw.day_in_week.trim())) {
        this.timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Day of week must be "Friday", "Saturday", or "Sunday"}` });
      }
      if (!tw.start_t || !this.validTimeFormatRegExp.test(tw.start_t)) {
        this.timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `Start time invalid` });
      }
      if (!tw.end_t || !this.validTimeFormatRegExp.test(tw.end_t)) {
        this.timeWindowErrors.push({ isValid: false, field: 'timeWindows', message: `End time invalid` });
      }
    }
    return this.timeWindowErrors;
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

  validateStudent(student: Student): ValidationError[] {
    return this.validators.map(validator => validator.valdiate(student)).flat()
  }
}

