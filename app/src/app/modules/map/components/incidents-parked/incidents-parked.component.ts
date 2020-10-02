import { Component, Input, OnChanges } from '@angular/core';
import { IncidentTypes } from '@data/incident';

@Component({
  selector: 'map-incidents-parked',
  templateUrl: './incidents-parked.component.html',
  styleUrls: ['./incidents-parked.component.scss']
})
export class IncidentsParkedComponent implements OnChanges {
  @Input() incidents: IncidentTypes.IncidentsCollectionByResolution;
  @Input() selectedIncident: IncidentTypes.Incident;
  @Input() active: boolean;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;
  @Input() showResolvedOnMap: (show: boolean) => void;
  @Input() setActiveFunction: () => void;
  @Input() userTimezone: string;

  public resolved = false;
  public overdue: ReadonlyArray<IncidentTypes.Incident> = [];
  public sending: ReadonlyArray<IncidentTypes.Incident> = [];
  public pending: ReadonlyArray<IncidentTypes.Incident> = [];

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
    this.overdue = [];
    this.sending = [];
    this.pending = [];

    this.incidents.unresolvedIncidents.map((incident: IncidentTypes.Incident) => {
      if(incident.status === IncidentTypes.SeasonalFishingStatuses.PARKED) {
        this.pending = [ ...this.pending, incident ];
      } else if(incident.status === IncidentTypes.SeasonalFishingStatuses.RECEIVING_AIS_POSITIONS) {
        this.sending = [ ...this.sending, incident ];
      } else if(incident.status === IncidentTypes.SeasonalFishingStatuses.OVERDUE) {
        this.overdue = [ ...this.overdue, incident ];
      }
    });
    this.pending = [ ...this.pending ].sort(this.incidentSortFunction);
    this.sending = [ ...this.sending ].sort(this.incidentSortFunction);
    this.overdue = [ ...this.overdue ].sort(this.incidentSortFunction);
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
