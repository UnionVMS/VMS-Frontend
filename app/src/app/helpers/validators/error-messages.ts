export const errorMessages = {
  email: 'Not a valid email address',
  validateEmail: 'Not a valid email address',
  phoneNumber: 'Not a valid phone number',
  swedishPhoneNumber: 'Not a valid swedish phone number',
  validateAlphanumeric: 'Not a valid alphanumeric string',
  maxlength: 'To many characters, max {requiredLength} allowed, {actualLength} given.',
  minlength: 'To few characters, minimum {requiredLength} required, {actualLength} given.',
  max: 'Number too big. Number maxsize: {max}, number given: {actual}',
  min: 'Number too small. Number minimumsize: {min}, number given: {actual}',
  momentNotValid: 'Not a valid date given.',
};

export const errorMessage = (errorType: string, errorObject: any = null) => {
  if(errorType === null) {
    return null;
  }

  let message = errorMessages[errorType];
  if(typeof message !== 'undefined' && errorObject !== null && typeof errorObject === 'object') {
    Object.keys(errorObject).map(key => {
      message = message.replace('{' + key + '}', errorObject[key]);
    });
  }

  return message;
};
