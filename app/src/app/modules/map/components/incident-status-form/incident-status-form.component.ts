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
  public static statuses = {
    POLL_FAILED: $localize`:@@ts-issue-status-poll-failed:Poll Failed`,
    ATTEMPTED_CONTACT: $localize`:@@ts-issue-status-attempted-contact:Attempted Contact`,
    MANUAL_POSITION_MODE: $localize`:@@ts-issue-status-manual-position-mode:Manual Position Mode`,
    LONG_TERM_PARKED: $localize`:@@ts-issue-status-long-term-parked:Long term parked`,
    TECHNICAL_ISSUE: $localize`:@@ts-issue-status-technical-issue:Technical issue`,
    RESOLVED: $localize`:@@ts-issue-status-resolved:Resolved`
  };

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
    return Object.keys(IncidentStatusFormComponent.statuses);
  }

  getStatusText(status: string) {
    return IncidentStatusFormComponent.statuses[status];
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
