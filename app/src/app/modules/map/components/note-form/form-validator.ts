import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';

export const createNotesFormValidator = () => {
  return new FormGroup({
    note: new FormControl('', [Validators.required]),
  });
};
