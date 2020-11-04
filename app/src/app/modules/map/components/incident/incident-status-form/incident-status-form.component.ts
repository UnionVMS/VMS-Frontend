import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { IncidentTypes } from '@data/incident';
import { createIncidentStatusFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'map-incident-status-form',
  templateUrl: './incident-status-form.component.html',
  styleUrls: ['./incident-status-form.component.scss']
})
export class IncidentStatusFormComponent implements OnChanges {
  @Input() status: string;
  @Input() changeStatus: (status: string) => void;
  @Output() triggerShowLog = new EventEmitter();

  public formValidator: FormGroup;

  ngOnChanges() {
    this.formValidator = createIncidentStatusFormValidator(this.status);
  }

  save() {
    this.changeStatus(this.formValidator.value.status);
  }

  getStatusKeys() {
    return Object.keys(IncidentTypes.StatusTranslations);
  }

  getStatusText(status: string) {
    return IncidentTypes.StatusTranslations[status];
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    return errorMessage(error);
  }
}
