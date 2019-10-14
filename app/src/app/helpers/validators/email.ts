import { FormControl } from '@angular/forms';

export const validateEmail = (c: FormControl) => {
  const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  return c.value === null || c.value.length === 0 || EMAIL_REGEXP.test(c.value) ? null : {
    validateEmail: true
  };
};
