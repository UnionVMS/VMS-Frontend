import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IncidentTypes } from '@data/incident';
import { createAttemptedContactFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'map-incident-attempted-contact-dialog',
  templateUrl: './incident-attempted-contact-dialog.component.html',
  styleUrls: ['./incident-attempted-contact-dialog.component.scss']
})
export class IncidentAttemptedContactDialogComponent {

  public formValidator: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    incident: IncidentTypes.Incident
  }) {
    this.formValidator = createAttemptedContactFormValidator();
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
