import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
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
export class IncidentExpiryDateFormComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() changeExpiryDate: (expiryDate: number | null) => void;
  @Input() createNote: (note: string) => void;

  @ViewChild('expiryDateForm') expiryDateForm: ElementRef;

  public formValidator: FormGroup;
  public autoUpdateDatetime = false;
  public bottomPosition = -48;
  public topPosition: number;
  public dateTimePickerPosition: {
    left: string, right: string, top?: string, bottom?: string
  } = { left: 'auto', right: '24px' };
  private intervalId: number;

  ngAfterViewInit() {
    this.intervalId = window.setInterval(() => {
      const distanceToWindowTop = this.expiryDateForm.nativeElement.getBoundingClientRect().top;
      if(-this.bottomPosition + 500 > distanceToWindowTop) {
        this.topPosition = -distanceToWindowTop;
        this.dateTimePickerPosition = { ...this.dateTimePickerPosition, top: this.topPosition + 'px', bottom: 'auto' };
      } else {
        this.dateTimePickerPosition = { ...this.dateTimePickerPosition, bottom: this.bottomPosition + 'px' };
      }
    }, 1000);
  }

  ngOnChanges() {
    this.formValidator = createIncidentExpiryDateFormValidator();
  }

  ngOnDestroy() {
    window.clearInterval(this.intervalId);
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
