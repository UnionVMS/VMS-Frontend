import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IncidentTypes } from '@data/incident';
import { createIncidentResolveFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'map-incident-resolve-dialog',
  templateUrl: './incident-resolve-dialog.component.html',
  styleUrls: ['./incident-resolve-dialog.component.scss']
})
export class IncidentResolveDialogComponent {

  public formValidator: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    incident: IncidentTypes.Incident
  }) {
    this.formValidator = createIncidentResolveFormValidator();
  }

  save() {
    return { note: this.formValidator.value.note };
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    return errorMessage(error);
  }
}
