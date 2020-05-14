import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';
import CustomValidators from '@validators/.';
// @ts-ignore
import moment from 'moment-timezone';

export const createNotesFormValidator = () => {
  return new FormGroup({
    latitude: new FormControl(null, [Validators.required]),
    latitudeDecimals: new FormControl(null, [Validators.required]),
    latitudeDirection: new FormControl('N', [Validators.required]),
    longitude: new FormControl(null, [Validators.required]),
    longitudeDecimals: new FormControl(null, [Validators.required]),
    longitudeDirection: new FormControl('E', [Validators.required]),
    speed: new FormControl(),
    heading: new FormControl(),
    timestamp: new FormControl(moment(), [CustomValidators.momentValid]),
  });
};
