import { FormControl } from '@angular/forms';

export const momentValid = (c: FormControl) => {
  return c.value.isValid() ? null : {
    momentNotValid: true
  };
};
