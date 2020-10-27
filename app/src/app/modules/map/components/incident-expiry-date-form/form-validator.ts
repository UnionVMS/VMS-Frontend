import { FormGroup, FormControl, Validators } from '@angular/forms';
import CustomValidators from '@validators/.';

export const createIncidentExpiryDateFormValidator = () => {
  return new FormGroup({
    expiryDate: new FormControl(null, [CustomValidators.momentValid]),
    note: new FormControl('', [Validators.required]),
  });
};
