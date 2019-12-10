import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesInterfaces } from '@data/notes';

export const createNotesFormValidator = () => {
  return new FormGroup({
    note: new FormControl('', [Validators.required, Validators.maxLength(255)]),
  });
};
