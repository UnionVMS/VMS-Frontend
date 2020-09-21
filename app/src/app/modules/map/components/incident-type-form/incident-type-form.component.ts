import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { IncidentTypes } from '@data/incident';
import { createIncidentTypeFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'map-incident-type-form',
  templateUrl: './incident-type-form.component.html',
  styleUrls: ['./incident-type-form.component.scss']
})
export class IncidentTypeFormComponent implements OnChanges {

  @Input() type: string;
  @Input() types: IncidentTypes.IncidentTypesCollection;
  @Input() changeType: (status: string) => void;

  public formValidator: FormGroup;

  ngOnChanges() {
    this.formValidator = createIncidentTypeFormValidator(this.type);
  }

  getTypeName(type) {
    return typeof IncidentTypes.IncidentTypesTranslations[type] !== 'undefined'
      ? IncidentTypes.IncidentTypesTranslations[type]
      : type;
  }

  save() {
    if(this.formValidator.valid) {
      this.changeType(this.formValidator.value.type);
    }
  }

  getErrors(path: string[]) {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors);
  }

  errorMessage(error: string) {
    return errorMessage(error);
  }
}
