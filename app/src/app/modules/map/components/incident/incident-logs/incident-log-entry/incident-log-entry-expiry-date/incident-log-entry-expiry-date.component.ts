import { Component, Input, OnChanges } from '@angular/core';

import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { IncidentTypes } from '@data/incident';


@Component({
  selector: 'map-incident-log-entry-expiry-date',
  templateUrl: './incident-log-entry-expiry-date.component.html',
  styleUrls: ['./incident-log-entry-expiry-date.component.scss']
})
export class IncidentLogEntryExpiryDateComponent implements OnChanges {
  @Input() logEntry: IncidentTypes.IncidentLogEntry;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public formattedExpiryDate: string;

  ngOnChanges() {
    this.formattedExpiryDate = formatUnixtime(this.logEntry.data.expiry);
  }
}
