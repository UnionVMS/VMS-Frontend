import { FormControl } from '@angular/forms';

export const momentValid = (c: FormControl) => {
  return c.value === null || c.value.isValid() ? null : {
    momentNotValid: true
  };
};

export const momentOnlyInThePast = (c: FormControl) => {
  return c.value !== null && c.value.format('x') < Date.now() ? null : {
    momentNotInThePast: true
  };
};
