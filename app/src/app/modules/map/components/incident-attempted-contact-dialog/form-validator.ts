import { FormGroup, FormControl, Validators } from '@angular/forms';
import CustomValidators from '@validators/.';

export const createAttemptedContactFormValidator = () => {
  return new FormGroup({
    note: new FormControl('', [Validators.required]),
  });
};
