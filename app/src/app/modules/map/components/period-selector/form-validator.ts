import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { MobileTerminalInterfaces } from '@data/mobile-terminal';
import CustomValidators from '@validators/.';


export const createPeriodSelectorFormValidator = (): FormGroup => {
  return new FormGroup({
    periodLength: new FormControl(86400, [Validators.required]),
    to: new FormControl(new Date(), [Validators.required]),
  });
};
