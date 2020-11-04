import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';

export const createIncidentStatusFormValidator = (status: string) => {
  return new FormGroup({
    status: new FormControl(status, [Validators.required, Validators.maxLength(255)]),
  });
};
