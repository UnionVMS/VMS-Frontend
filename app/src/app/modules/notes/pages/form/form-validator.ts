import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesInterfaces } from '@data/notes';
import CustomValidators from '@validators/.';

export const createNotesFormValidator = (note: NotesInterfaces.Note) => {
  return new FormGroup({
    essentailFields: new FormGroup({
      noteuser: new FormControl(note.user, [Validators.required, Validators.maxLength(255)]),
      notes: new FormControl(note.notes, [Validators.required, Validators.maxLength(255)]),
    }),
  });
};
