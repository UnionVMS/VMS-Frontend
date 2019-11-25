import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { formatDate, formatTimestamp } from '@app/helpers/helpers';

import { createPeriodSelectorFormValidator } from './form-validator';

@Component({
  selector: 'map-period-selector',
  templateUrl: './period-selector.component.html',
  styleUrls: ['./period-selector.component.scss']
})
export class PeriodSelectorComponent implements OnInit {

  @Input() setPeriod: (from: string, to: string) => void;
  public formValidator: FormGroup;

  public periods = [
    { value: 86400, label: '24 hours' },  // 24 * 60 * 60
    { value: 172800, label: '48 hours' }, // 48 * 60 * 60
    { value: 259200, label: '72 hours' }, // 72 * 60 * 60
    { value: 345600, label: '96 hours' }, // 96 * 60 * 60
  ];

  ngOnInit() {
    this.formValidator = createPeriodSelectorFormValidator();
  }

  public getReport = () => {
    const startDateTimestamp = (this.formValidator.value.to.getTime() - (this.formValidator.value.periodLength * 1000)) / 1000;
    this.setPeriod(formatTimestamp(startDateTimestamp), formatDate(this.formValidator.value.to));
  }
}
