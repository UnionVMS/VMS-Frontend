import { Component, Input, OnChanges } from '@angular/core';
import { IncidentTypes } from '@data/incident';
import { Position } from '@data/generic.types';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

@Component({
  selector: 'map-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent implements OnChanges {
  @Input() incidents: IncidentTypes.IncidentsCollectionByResolution;
  @Input() selectedIncident: IncidentTypes.Incident;
  @Input() incidentNotifications: IncidentTypes.IncidentNotificationsCollections;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;

  public resolved = false;
  public incidentsWithAttemptedContact: ReadonlyArray<IncidentTypes.Incident> = [];
  public unmanagedIncidents: ReadonlyArray<IncidentTypes.Incident> = [];

  public incidentTypeUrgencry = {
    [IncidentTypes.IncidentRisk.low]: 1,
    [IncidentTypes.IncidentRisk.medium]: 2,
    [IncidentTypes.IncidentRisk.high]: 3,
  };

  public trackByIncidents = (index: number, item: IncidentTypes.Incident) => {
    return item.id;
  }

  public switchShowResolved = () => {
    this.resolved = !this.resolved;
  }

  ngOnChanges() {
    this.incidentsWithAttemptedContact = [];
    this.unmanagedIncidents = [];
    this.incidents.unresolvedIncidents.map((incident: IncidentTypes.Incident) => {
      if(incident.status === IncidentTypes.AssetNotSendingStatuses.ATTEMPTED_CONTACT) {
        this.incidentsWithAttemptedContact = [ ...this.incidentsWithAttemptedContact, incident ];
      } else {
        this.unmanagedIncidents = [ ...this.unmanagedIncidents, incident ];
      }
    });
    this.incidentsWithAttemptedContact = [ ...this.incidentsWithAttemptedContact ].sort(this.incidentSortFunction);
    this.unmanagedIncidents = [ ...this.unmanagedIncidents ].sort(this.incidentSortFunction);
  }

  private readonly incidentSortFunction = (a: IncidentTypes.Incident, b: IncidentTypes.Incident) => {
    if(this.incidentTypeUrgencry[a.risk] > this.incidentTypeUrgencry[b.risk]) {
      return -1;
    } else if(this.incidentTypeUrgencry[a.risk] < this.incidentTypeUrgencry[b.risk]) {
      return 1;
    } else {
      return a.createDate - b.createDate;
    }
  }

  incidentIsSelected(incident: IncidentTypes.Incident) {
    return typeof this.selectedIncident !== 'undefined' && this.selectedIncident.id === incident.id;
  }
}
