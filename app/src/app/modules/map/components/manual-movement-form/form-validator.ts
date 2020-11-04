import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesTypes } from '@data/notes';
import CustomValidators from '@validators/.';
// @ts-ignore
import moment from 'moment-timezone';

export const createManualMovementFormValidator = () => {
  return new FormGroup({
    latitude: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(90)]),
    latitudeMinute: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(59)]),
    latitudeDecimals: new FormControl(null, [Validators.required, Validators.min(0)]),
    latitudeDirection: new FormControl('N', [Validators.required]),
    longitude: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(180)]),
    longitudeMinute: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(59)]),
    longitudeDecimals: new FormControl(null, [Validators.required, Validators.min(0)]),
    longitudeDirection: new FormControl('E', [Validators.required]),
    speed: new FormControl(null, [Validators.min(0), Validators.max(40)]),
    heading: new FormControl(null, [Validators.min(0), Validators.max(360)]),
    timestamp: new FormControl(moment(), [CustomValidators.momentValid, CustomValidators.momentNotInTheFuture]),
    note: new FormControl('', [Validators.required]),
  });
};
