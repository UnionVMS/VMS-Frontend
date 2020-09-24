import { Component, Input, OnChanges } from '@angular/core';
import { IncidentTypes } from '@data/incident';
import { Position } from '@data/generic.types';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

@Component({
  selector: 'map-incidents-asset-not-sending',
  templateUrl: './incidents-asset-not-sending.component.html',
  styleUrls: ['./incidents-asset-not-sending.component.scss']
})
export class IncidentsAssetNotSendingComponent implements OnChanges {
  @Input() incidents: IncidentTypes.IncidentsCollectionByResolution;
  @Input() selectedIncident: IncidentTypes.Incident;
  @Input() active: boolean;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;
  @Input() showResolvedOnMap: (show: boolean) => void;
  @Input() setActiveFunction: () => void;

  public resolved = false;
  public incidentsWithAttemptedContact: ReadonlyArray<IncidentTypes.Incident> = [];
  public unmanagedIncidents: ReadonlyArray<IncidentTypes.Incident> = [];
  public nrOfIncidentsSortedByUrgency = {
    high: 0,
    medium: 0
  };

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
    this.showResolvedOnMap(this.resolved);
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

    this.nrOfIncidentsSortedByUrgency = this.unmanagedIncidents.reduce((acc, incident) => {
      if(incident.risk === IncidentTypes.IncidentRisk.high) {
        acc.high++;
      } else if(incident.risk === IncidentTypes.IncidentRisk.medium) {
        acc.medium++;
      }

      return acc;
    }, { high: 0, medium: 0 });
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
