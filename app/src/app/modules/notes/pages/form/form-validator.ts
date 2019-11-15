import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesInterfaces } from '@data/notes';

export const createNotesFormValidator = (note: NotesInterfaces.Note) => {
  return new FormGroup({
    essentailFields: new FormGroup({
      user: new FormControl(note.user, [Validators.required, Validators.maxLength(255)]),
      notes: new FormControl(note.notes, [Validators.required, Validators.maxLength(255)]),
    }),
  });
};
