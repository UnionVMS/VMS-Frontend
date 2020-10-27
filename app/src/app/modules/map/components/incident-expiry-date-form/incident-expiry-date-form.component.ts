import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { IncidentTypes } from '@data/incident';
import { createIncidentExpiryDateFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'map-incident-expiry-date-form',
  templateUrl: './incident-expiry-date-form.component.html',
  styleUrls: ['./incident-expiry-date-form.component.scss']
})
export class IncidentExpiryDateFormComponent implements OnChanges {

  @Input() changeExpiryDate: (expiryDate: number | null) => void;
  @Input() createNote: (note: string) => void;

  public formValidator: FormGroup;
  public autoUpdateDatetime = false;

  ngOnChanges() {
    this.formValidator = createIncidentExpiryDateFormValidator();
  }

  save() {
    const expiryDate = this.formValidator.value.expiryDate !== null
      ? this.formValidator.value.expiryDate.format('x')
      : null;
    this.changeExpiryDate(expiryDate);
    this.createNote(this.formValidator.value.note);

    this.autoUpdateDatetime = true;
    this.formValidator = createIncidentExpiryDateFormValidator();
    setTimeout(() => {
      this.autoUpdateDatetime = false;
    }, 100);
  }

  updateTimestamp(dateTime: moment.Moment) {
    const formControl = this.formValidator.get('expiryDate');
    formControl.setValue(dateTime);
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

  getErrorMessages(path: string[]): string[] {
    return this.getErrors(path).map(error => this.errorMessage(error));
  }
}
