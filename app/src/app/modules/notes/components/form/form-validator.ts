import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesInterfaces } from '@data/notes';

export const createNotesFormValidator = (note: NotesInterfaces.Note) => {
  return new FormGroup({
    essentailFields: new FormGroup({
      note: new FormControl(note.note, [Validators.required, Validators.maxLength(255)]),
    }),
  });
};
