import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
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

  public statuses = {
    POLL_FAILED: 'Poll Failed',
    ATTEMPTED_CONTACT: 'Attempted Contact',
    MANUAL_POSITION_MODE: 'Manual Position Mode',
    LONG_TERM_PARKED: 'Long term parked',
    TECHNICAL_ISSUE: 'Technical issue',
    RESOLVED: 'Resolved'
  };

  ngOnChanges() {
    this.formValidator = createIncidentStatusFormValidator(this.status);
  }

  save() {
    this.changeStatus(this.formValidator.value.status);
  }

  getStatusKeys() {
    return Object.keys(this.statuses);
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
