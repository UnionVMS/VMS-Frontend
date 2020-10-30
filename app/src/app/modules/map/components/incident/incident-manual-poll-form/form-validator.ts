import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';

export const createManualPollFormValidator = () => {
  return new FormGroup({
    comment: new FormControl('', [Validators.required, Validators.maxLength(255)]),
  });
};
