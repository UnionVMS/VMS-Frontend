import { FormGroup, FormControl, Validators } from '@angular/forms';
import CustomValidators from '@validators/.';

export const createIncidentTypeFormValidator = (type: string, disabled: boolean) => {
  return new FormGroup({
    type: new FormControl({ value: type, disabled }, [Validators.required, Validators.maxLength(255)]),
  });
};
