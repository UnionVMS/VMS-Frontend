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

  public static typeTranslations = {
    ASSET_NOT_SENDING: $localize`:@@ts-issue-type-asset-not-sending:Asset not sending`,
    SEASONAL_FISHING: $localize`:@@ts-issue-type-seasonal-fishing:Seasonal fishing`,
    OWNER_TRANSFER: $localize`:@@ts-issue-type-owner-transfer:Ownership transfer`,
    LONG_TERM_PARKED: $localize`:@@ts-issue-type-long-term-parked:Long term parked`,
    PARKED: $localize`:@@ts-issue-type-parked:Parked`,
    MANUAL_MODE: $localize`:@@ts-issue-type-manual-mode:Manual mode`
  };

  @Input() type: string;
  @Input() types: IncidentTypes.IncidentTypesCollection;
  @Input() changeType: (status: string, expiryDate: number | null) => void;

  public formValidator: FormGroup;

  ngOnChanges() {
    this.formValidator = createIncidentTypeFormValidator(this.type);
  }

  getTypeName(type) {
    return typeof IncidentTypeFormComponent.typeTranslations[type] !== 'undefined'
      ? IncidentTypeFormComponent.typeTranslations[type]
      : type;
  }

  save() {
    const expiryDate = this.formValidator.value.expiryDate !== null
      ? this.formValidator.value.expiryDate.format('x')
      : null;
    this.changeType(this.formValidator.value.type, expiryDate);
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
