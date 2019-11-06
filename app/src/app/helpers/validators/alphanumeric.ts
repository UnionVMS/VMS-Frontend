import { FormControl } from '@angular/forms';

export const alphanumeric = (c: FormControl) => {
  const EMAIL_REGEXP = /^[a-z0-9]*$/i;
  return c.value === null || c.value.length === 0 || EMAIL_REGEXP.test(c.value) ? null : {
    validateAlphanumeric: true
  };
};
