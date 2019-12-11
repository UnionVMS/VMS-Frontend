import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { NotesActions, NotesInterfaces, NotesSelectors } from '@data/notes';
import { AssetInterfaces } from '@data/asset';
import { createNotesFormValidator } from './form-validator';

import { errorMessage } from '@app/helpers/validators/error-messages';
import { formatDate } from '@app/helpers/helpers';

@Component({
  selector: 'map-manual-movement-form',
  templateUrl: './manual-movement-form.component.html',
  styleUrls: ['./manual-movement-form.component.scss']
})
export class ManualMovementFormComponent implements OnInit {
  @Input() createManualMovement: (manualMovement: AssetInterfaces.Movement) => void;

  public formValidator: FormGroup;

  ngOnInit() {
    this.formValidator = createNotesFormValidator();
  }

  save() {
    this.createManualMovement({
      location: {
        longitude: parseFloat(this.formValidator.value.longitude),
        latitude: parseFloat(this.formValidator.value.latitude),
      },
      heading: parseFloat(this.formValidator.value.heading),
      timestamp: Math.floor(new Date(this.formValidator.value.timestamp).getTime() / 1000),
      speed: parseFloat(this.formValidator.value.speed),
    } as AssetInterfaces.Movement);
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    if(error === 'maxlength') {
      return 'Text can not be longer then 255 characters.';
    }

    return errorMessage(error);
  }
}
