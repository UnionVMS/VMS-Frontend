import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesInterfaces } from '@data/notes';

export const createNotesFormValidator = () => {
  return new FormGroup({
    latitude: new FormControl('', [Validators.required]),
    longitude: new FormControl('', [Validators.required]),
    speed: new FormControl('', [Validators.required]),
    heading: new FormControl('', [Validators.required]),
    timestamp: new FormControl('', [Validators.required]),
  });
};
