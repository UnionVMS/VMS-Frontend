import { FormControl } from '@angular/forms';

export const phoneNumber = (c: FormControl) => {
  const REGEXP = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;
  return c.value === null || c.value.length === 0 || REGEXP.test(c.value) ? null : {
    phoneNumber: true
  };
};

export const swedishPhoneNumber = (c: FormControl) => {
  const REGEXP = /^([+]46)\s*(7[0236])\s*(\d{4})\s*(\d{3})$/i;
  return c.value === null || c.value.length === 0 || REGEXP.test(c.value) ? null : {
    swedishPhoneNumber: true
  };
};
