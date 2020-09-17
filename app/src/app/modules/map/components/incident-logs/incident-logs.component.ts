import { Component, ViewEncapsulation, Input, OnChanges, OnInit } from '@angular/core';

import { IncidentTypes } from '@data/incident';

@Component({
  selector: 'map-incident-logs',
  templateUrl: './incident-logs.component.html',
  styleUrls: ['./incident-logs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IncidentLogsComponent implements OnChanges, OnInit {
  @Input() incident: IncidentTypes.Incident;
  @Input() incidentLog: IncidentTypes.IncidentLog;

  @Input() getLogForIncident: (incidentId: number) => void;

  public selectedTabIndex = 0;
  public incidentStatusLog: IncidentTypes.IncidentLog;
  public incidentManualPositionLog: IncidentTypes.IncidentLog;

  ngOnInit() {
    this.getLogForIncident(this.incident.id);
  }

  ngOnChanges() {
    if(typeof this.incidentLog !== 'undefined') {
      this.incidentStatusLog = {
        log: Object.values(this.incidentLog.log).reduce((incidentStatusLog, logEntry) => {
          if(logEntry.eventType === 'INCIDENT_STATUS') {
            incidentStatusLog = { ...incidentStatusLog, [logEntry.id]: logEntry };
          }
          return incidentStatusLog;
        }, {}),
        relatedObjects: { notes: {}, polls: {}, positions: {} }
      };
      this.incidentManualPositionLog = {
        log: Object.values(this.incidentLog.log).reduce((incidentStatusLog, logEntry) => {
          if(logEntry.eventType === 'MANUAL_POSITION') {
            incidentStatusLog = { ...incidentStatusLog, [logEntry.id]: logEntry };
          }
          return incidentStatusLog;
        }, {}),
        relatedObjects: { notes: {}, polls: {}, positions: this.incidentLog.relatedObjects.positions }
      };
    }
  }

  changeTab(tabIndex: number) {
    this.selectedTabIndex = tabIndex;
  }
}
