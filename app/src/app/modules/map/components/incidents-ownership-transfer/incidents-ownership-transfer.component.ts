import { Component, Input, OnChanges } from '@angular/core';
import { IncidentTypes } from '@data/incident';

@Component({
  selector: 'map-incidents-ownership-transfer',
  templateUrl: './incidents-ownership-transfer.component.html',
  styleUrls: ['./incidents-ownership-transfer.component.scss']
})
export class IncidentsOwnershipTransferComponent implements OnChanges {
  @Input() incidents: IncidentTypes.IncidentsCollectionByResolution;
  @Input() selectedIncident: IncidentTypes.Incident;
  @Input() active: boolean;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;
  @Input() showResolvedOnMap: (show: boolean) => void;
  @Input() setActiveFunction: () => void;
  @Input() userTimezone: string;

  public resolved = false;
  public notReceivingVms: ReadonlyArray<IncidentTypes.Incident> = [];
  public receivingVms: ReadonlyArray<IncidentTypes.Incident> = [];

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
    this.notReceivingVms = [];
    this.receivingVms = [];

    this.incidents.unresolvedIncidents.map((incident: IncidentTypes.Incident) => {
      if(incident.status === IncidentTypes.OwnershipTransferStatuses.NOT_RECEIVING_VMS_POSITIONS) {
        this.notReceivingVms = [ ...this.notReceivingVms, incident ];
      } else if(incident.status === IncidentTypes.OwnershipTransferStatuses.RECEIVING_VMS_POSITIONS) {
        this.receivingVms = [ ...this.receivingVms, incident ];
      }
    });
    this.notReceivingVms = [ ...this.notReceivingVms ].sort(this.incidentSortFunction);
    this.receivingVms = [ ...this.receivingVms ].sort(this.incidentSortFunction);
  }

  private readonly incidentSortFunction = (a: IncidentTypes.Incident, b: IncidentTypes.Incident) => {
    return a.createDate - b.createDate;
  }

  incidentIsSelected(incident: IncidentTypes.Incident) {
    return typeof this.selectedIncident !== 'undefined' && this.selectedIncident.id === incident.id;
  }

  getLastSeenTime(incident: IncidentTypes.Incident) {
    return typeof incident.lastKnownLocation !== 'undefined' ? incident.lastKnownLocation.timestamp : undefined;
  }
}
