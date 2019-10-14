export const errorMessages = {
  email: 'Not a valid email address',
  validateEmail: 'Not a valid email address',
  phoneNumber: 'Not a valid phone number',
  swedishPhoneNumber: 'Not a valid swedish phone number',
};

export const errorMessage = (error: string) => errorMessages[error];
