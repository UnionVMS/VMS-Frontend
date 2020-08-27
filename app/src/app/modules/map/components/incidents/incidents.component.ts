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
  @Input() incidents: IncidentTypes.IncidentsCollectionByType;
  @Input() selectedIncident: IncidentTypes.Incident;
  @Input() incidentNotifications: IncidentTypes.IncidentNotificationsCollections;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;

  public resolved = false;
  public incidentsWithAttemptedContact: ReadonlyArray<IncidentTypes.Incident> = [];
  public unmanagedIncidents: ReadonlyArray<IncidentTypes.Incident> = [];

  public incidentStatusClass = {
    MANUAL_POSITION_MODE: 'dangerLvl1',
    ATTEMPTED_CONTACT: 'dangerLvl5',
    LONG_TERM_PARKED: 'dangerLvl0',
    RESOLVED: 'dangerLvl0',
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
  }

  incidentIsSelected(incident: IncidentTypes.Incident) {
    return typeof this.selectedIncident !== 'undefined' && this.selectedIncident.id === incident.id;
  }
}
