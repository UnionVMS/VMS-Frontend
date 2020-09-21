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
    OWNERSHIP_TRANSFER: $localize`:@@ts-issue-type-ownership-transfer:Ownership transfer`,
    LONG_TERM_PARKED: $localize`:@@ts-issue-type-long-term-parked:Long term parked`,
    PARKED: $localize`:@@ts-issue-type-parked:Parked`,
    MANUAL_POSITION_MODE: $localize`:@@ts-issue-type-manual-position-mode:Manual position mode`
  };

  @Input() type: string;
  @Input() types: IncidentTypes.IncidentTypesCollection;
  @Input() changeType: (status: string) => void;

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
