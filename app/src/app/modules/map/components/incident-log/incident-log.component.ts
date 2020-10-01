import { Component, Input, OnChanges } from '@angular/core';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';

import { IncidentTypes } from '@data/incident';
import { IncidentStatusFormComponent } from '../incident-status-form/incident-status-form.component';


@Component({
  selector: 'map-incident-log',
  templateUrl: './incident-log.component.html',
  styleUrls: ['./incident-log.component.scss']
})
export class IncidentLogComponent implements OnChanges {
  @Input() incidentLog: IncidentTypes.IncidentLog;

  public incidentLogList: ReadonlyArray<IncidentTypes.IncidentLogEntry> = [];
  public expanded: Array<number> = [];

  ngOnChanges() {
    this.incidentLogList = Object.values(this.incidentLog.log).sort((a, b) => a.createDate - b.createDate);
  }

  formatTime(unixtime: number) {
    return formatUnixtimeWithDot(unixtime);
  }

  isExpanded(logEntryId: number) {
    return this.expanded.includes(logEntryId);
  }

  getStatusText(status: string) {
    return IncidentTypes.statusTranslations[status] || status;
  }
}
