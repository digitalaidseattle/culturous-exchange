const validateName = (errorMessage: string | null = null, value: string, minLength: number, maxLength: number) => {
  if (value.length >= 1) {
    value.length < minLength ? errorMessage = `Name must be at least ${minLength} characters` : null;
    value.length > maxLength ? errorMessage = `Name must be less than ${maxLength} characters` : null;
  }
  return errorMessage
}

const validateAge = (errorMessage: string | null = null, value: number, minLength: number, maxLength: number) => {
  if (value >= 1) {
    value <= minLength ? errorMessage = `Age must be greater than ${minLength}` : null;
    value >= maxLength ? errorMessage = `Age must be less than ${maxLength}` : null;
  }
  return errorMessage
}

const validateEmail = (errorMessage: string | null = null, value: string) => {
  if (value.length >= 1) {
    //allow common numbers and symbols and check for chars before @, @ itself, dot, chars following dot, and no additional chars at end
    const emailRegex = new RegExp("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    !emailRegex.test(value) ? errorMessage = "Please enter a valid email" : null;
  }
  return errorMessage;
}

const validateGender = (errorMessage: string | null = null, value: string) => {
  return !value.length ? errorMessage = 'Selection required' : null;
}


export { validateName, validateAge, validateEmail, validateGender }