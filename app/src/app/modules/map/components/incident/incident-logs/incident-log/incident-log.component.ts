import { Component, Input, OnChanges } from '@angular/core';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';

import { IncidentTypes } from '@data/incident';

@Component({
  selector: 'map-incident-log',
  templateUrl: './incident-log.component.html',
  styleUrls: ['./incident-log.component.scss']
})
export class IncidentLogComponent implements OnChanges {
  @Input() incidentLog: IncidentTypes.IncidentLog;
  @Input() userTimezone: string;

  public incidentLogList: ReadonlyArray<IncidentTypes.IncidentLogEntry> = [];
  public expanded: Array<number> = [];

  ngOnChanges() {
    this.incidentLogList = Object.values(this.incidentLog.log).sort((a, b) => b.createDate - a.createDate);
  }

  formatTime(unixtime: number) {
    return formatUnixtimeWithDot(unixtime);
  }

  isExpanded(logEntryId: number) {
    return this.expanded.includes(logEntryId);
  }

  getStatusText(status: string) {
    return IncidentTypes.StatusTranslations[status] || status;
  }

  isAutoPollCreationFailedEvent(logEntry: IncidentTypes.IncidentLogEntry) {
    return logEntry.eventType === IncidentTypes.LogEntryType.AUTO_POLL_CREATION_FAILED;
  }

  isIncidentTypeChangeEvent(logEntry: IncidentTypes.IncidentLogEntry) {
    return logEntry.eventType === IncidentTypes.LogEntryType.INCIDENT_TYPE;
  }

  isExpiryDateEvent(logEntry: IncidentTypes.IncidentLogEntry) {
    return logEntry.eventType === IncidentTypes.LogEntryType.EXPIRY_UPDATED;
  }

  isStatusUpdatedEvent(logEntry: IncidentTypes.IncidentLogEntry) {
    return logEntry.eventType === IncidentTypes.LogEntryType.INCIDENT_STATUS;
  }

  getIncidentTypeTranslation(incidentTypeName: string) {
    return IncidentTypes.IncidentTypesTranslations[incidentTypeName] || incidentTypeName;
  }

  getIncidentStatusTranslation(incidentStatus: string) {
    return IncidentTypes.StatusTranslations[incidentStatus] || incidentStatus;
  }
}
