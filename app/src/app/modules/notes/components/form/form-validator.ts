import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';

export const createNotesFormValidator = (note: NotesTypes.Note) => {
  return new FormGroup({
    essentailFields: new FormGroup({
      note: new FormControl(note.note, [Validators.required, Validators.maxLength(255)]),
    }),
  });
};
