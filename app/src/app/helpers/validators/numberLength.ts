import { FormControl } from '@angular/forms';

export const minLengthOfNumber = (min: number) => (c: FormControl) => {
  return (c.value + '').length >= min
    ? null
    : {
      minlength: {
        requiredLength: min,
        actualLength: (c.value + '').length
      }
    };
};

export const maxLengthOfNumber = (max: number) => (c: FormControl) => {
  return (c.value + '').length <= max
    ? null
    : {
      maxlength: {
        requiredLength: max,
        actualLength: (c.value + '').length
      }
    };
};
