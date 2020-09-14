import { FormGroup, FormControl, Validators } from '@angular/forms';
import CustomValidators from '@validators/.';

export const createIncidentTypeFormValidator = (type: string) => {
  return new FormGroup({
    type: new FormControl(type, [Validators.required, Validators.maxLength(255)]),
    expiryDate: new FormControl(null, [CustomValidators.momentValid]),
  });
};
