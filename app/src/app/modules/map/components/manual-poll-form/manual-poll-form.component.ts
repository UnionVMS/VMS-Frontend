import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AssetTypes } from '@data/asset';
import { createManualPollFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

// @ts-ignore
import moment from 'moment-timezone';


@Component({
  selector: 'map-manual-poll-form',
  templateUrl: './manual-poll-form.component.html',
  styleUrls: ['./manual-poll-form.component.scss']
})
export class ManualPollFormComponent implements OnInit {
  @Input() pollAsset: (assetId: number, pollPostObject: AssetTypes.PollPostObject) => void;
  @Input() assetId: number;

  public pollType = 'manual';

  public formValidator: FormGroup;
  public save = () => {
    let params: AssetTypes.PollPostObject = { comment: this.formValidator.value.comment };

    if(this.pollType === 'program') {
      params = { ...params,
        pollType: AssetTypes.PollType.PROGRAM_POLL,
        frequency: (
          (this.formValidator.value.frequencyHours * 60) // Convert to minutes
          + this.formValidator.value.frequencyMinutes
        ) * 60, // Convert everything to seconds
        startDate: Math.floor(this.formValidator.value.from.format('x')),
        endDate: Math.floor(this.formValidator.value.to.format('x')),
      };
    }

    this.formValidator = createManualPollFormValidator();

    return this.pollAsset(
      this.assetId,
      params
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

  getErrorMessages(path: string[]): string[] {
    return this.getErrors(path).map(error => this.errorMessage(error));
  }

  updateTimestamp(dateTime: moment.Moment, field: string) {
    const formControl = this.formValidator.get(field);
    formControl.setValue(dateTime);
  }

  pollTypeUpdated(event) {
    if(event.value === 'program') {
      this.formValidator.get('frequencyHours').enable();
      this.formValidator.get('frequencyMinutes').enable();
    } else {
      this.formValidator.get('frequencyHours').disable();
      this.formValidator.get('frequencyMinutes').disable();
    }
  }
}
