import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IncidentTypes } from '@data/incident';
import { createIncidentTypeFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'map-incident-type-form-dialog',
  templateUrl: './incident-type-form-dialog.component.html',
  styleUrls: ['./incident-type-form-dialog.component.scss']
})
export class IncidentTypeFormDialogComponent {

  public formValidator: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    type: string,
    types: IncidentTypes.IncidentTypesCollection,
    incident: IncidentTypes.Incident
  }) {
    this.formValidator = createIncidentTypeFormValidator(this.data.type);
  }

  getTypeName(type) {
    return typeof IncidentTypes.IncidentTypesTranslations[type] !== 'undefined'
      ? IncidentTypes.IncidentTypesTranslations[type]
      : type;
  }

  save() {
    const expiryDate = this.formValidator.value.expiryDate !== null
      ? this.formValidator.value.expiryDate.format('x')
      : null;
    return { type: this.formValidator.value.type, note: this.formValidator.value.note, expiryDate: expiryDate };
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    return errorMessage(error);
  }

  updateTimestamp(dateTime: moment.Moment) {
    const formControl = this.formValidator.get('expiryDate');
    formControl.setValue(dateTime);
  }
}
