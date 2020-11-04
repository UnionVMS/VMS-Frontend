import { Component, Input, OnChanges } from '@angular/core';

import { formatUnixtime } from '@app/helpers/datetime-formatter';

import { IncidentTypes } from '@data/incident';
import { AssetTypes } from '@data/asset';


@Component({
  selector: 'map-incident-log-entry-poll',
  templateUrl: './incident-log-entry-poll.component.html',
  styleUrls: ['./incident-log-entry-poll.component.scss']
})
export class IncidentLogEntryPollComponent implements OnChanges {
  @Input() poll: AssetTypes.PollStatusObject;
  @Input() userTimezone: string; // Ensure the component is updated when the timezone changes.

  public history: ReadonlyArray<{ status: AssetTypes.PollStatus, formattedStatus: string, time: string; }> = [];
  public lastStatusIsFailedOrTimedOut: boolean;

  ngOnChanges() {
    this.history = this.poll.history.slice().sort((a, b) => b.timestamp - a.timestamp).map((row) => ({
      status: row.status,
      formattedStatus: (row.status.charAt(0) + row.status.slice(1).toLowerCase()).replace('_', ' '),
      time: formatUnixtime(row.timestamp)
    }));
    this.lastStatusIsFailedOrTimedOut = [
      AssetTypes.PollStatus.TIMED_OUT,
      AssetTypes.PollStatus.FAILED
    ].includes(this.history[0].status);
  }
}
