import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';
import CustomValidators from '@validators/.';
// @ts-ignore
import moment from 'moment-timezone';

export const createNotesFormValidator = () => {
  return new FormGroup({
    latitude: new FormControl('', [Validators.required]),
    longitude: new FormControl('', [Validators.required]),
    speed: new FormControl('', [Validators.required]),
    heading: new FormControl('', [Validators.required]),
    timestamp: new FormControl(moment(), [CustomValidators.momentValid]),
  });
};
