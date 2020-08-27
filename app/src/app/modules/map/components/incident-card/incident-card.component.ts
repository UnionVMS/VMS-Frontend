import { Component, Input } from '@angular/core';
import { IncidentTypes } from '@data/incident';
import { Position } from '@data/generic.types';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

@Component({
  selector: 'map-incident-card',
  templateUrl: './incident-card.component.html',
  styleUrls: ['./incident-card.component.scss']
})
export class IncidentCardComponent {
  @Input() incident: IncidentTypes.Incident;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;

  public incidentsWithAttemptedContact: ReadonlyArray<IncidentTypes.Incident> = [];
  public unmanagedIncidents: ReadonlyArray<IncidentTypes.Incident> = [];

  public incidentStatusClass = {
    MANUAL_POSITION_MODE: 'dangerLvl1',
    ATTEMPTED_CONTACT: 'dangerLvl5',
    LONG_TERM_PARKED: 'dangerLvl0',
    RESOLVED: 'dangerLvl0',
  };

  formatDate(incident: IncidentTypes.Incident) {
    return formatUnixtimeWithDot(incident.lastKnownLocation.timestamp);
  }

  formatCoordinates(location: Position) {
    const formattedLocation = convertDDToDDM(location.latitude, location.longitude, 2);
    return formattedLocation.latitude + ', ' + formattedLocation.longitude;
  }
}
