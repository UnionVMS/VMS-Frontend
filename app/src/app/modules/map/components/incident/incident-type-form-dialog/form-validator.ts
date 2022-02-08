import { FormGroup, FormControl, Validators } from '@angular/forms';
import CustomValidators from '@validators/.';

export const createIncidentTypeFormValidator = (type: string) => {
  return new FormGroup({
    expiryDate: new FormControl(),
    type: new FormControl(type, [Validators.required]),
    note: new FormControl('', [Validators.required]),
  });
};
