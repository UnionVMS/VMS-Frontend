import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { NotesActions, NotesTypes, NotesSelectors } from '@data/notes';
import { createManualPollFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

@Component({
  selector: 'map-manual-poll-form',
  templateUrl: './manual-poll-form.component.html',
  styleUrls: ['./manual-poll-form.component.scss']
})
export class ManualPollFormComponent implements OnInit {
  @Input() pollIncident: (incidentId: number, comment: string) => void;
  @Input() incidentId: number;

  public formValidator: FormGroup;
  public save = () => {
    return this.pollIncident(
      this.incidentId,
      this.formValidator.value.comment
    );
  }

  ngOnInit() {
    this.formValidator = createManualPollFormValidator();
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
