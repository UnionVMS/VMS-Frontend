import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';

export const createManualPollFormValidator = () => {
  return new FormGroup({
    comment: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    from: new FormControl(),
    to: new FormControl(),
    frequencyHours: new FormControl({ value: 0, disabled: true }, [Validators.required, Validators.min(0)]),
    frequencyMinutes: new FormControl({ value: 0, disabled: true }, [Validators.required, Validators.min(0)]),
  });
};
