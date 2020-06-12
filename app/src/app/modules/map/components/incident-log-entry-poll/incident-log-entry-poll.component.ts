import { Component, Input, OnChanges } from '@angular/core';

import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { IncidentTypes } from '@data/incident';


@Component({
  selector: 'map-incident-log-entry-poll',
  templateUrl: './incident-log-entry-poll.component.html',
  styleUrls: ['./incident-log-entry-poll.component.scss']
})
export class IncidentLogEntryPollComponent implements OnChanges {
  @Input() poll: IncidentTypes.pollLogEntry;

  public history: ReadonlyArray<{ status: string, time: string; }> = [];

  ngOnChanges() {
    this.history = this.poll.history.slice().sort((a, b) => a.timestamp - b.timestamp).map((row) => ({
      status: row.status,
      time: formatUnixtime(row.timestamp)
    }));
  }
}
