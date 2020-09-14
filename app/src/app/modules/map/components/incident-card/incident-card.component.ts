import { Component, Input, OnChanges } from '@angular/core';
import { IncidentTypes } from '@data/incident';
import { Position } from '@data/generic.types';

import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

@Component({
  selector: 'map-incident-card',
  templateUrl: './incident-card.component.html',
  styleUrls: ['./incident-card.component.scss']
})
export class IncidentCardComponent implements OnChanges {
  @Input() incident: IncidentTypes.Incident;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;
  @Input() incidentIsSelected: boolean;
  @Input() urgency: IncidentTypes.IncidentRisk;

  public formattedIncident: IncidentTypes.Incident & {
    formattedDate: string;
    formattedCoordinates: string;
    lastKnownLocationStatus?: string;
  };


  ngOnChanges() {
    if(typeof this.incident.lastKnownLocation !== 'undefined') {
      const formattedLocation = convertDDToDDM(
        this.incident.lastKnownLocation.location.latitude,
        this.incident.lastKnownLocation.location.longitude,
        2
      );
      this.formattedIncident = {
        ...this.incident,
        formattedDate: formatUnixtimeWithDot(this.incident.lastKnownLocation.timestamp),
        formattedCoordinates: formattedLocation.latitude + ', ' + formattedLocation.longitude,
        lastKnownLocationStatus: this.incident.lastKnownLocation.status
      };
    } else {
      this.formattedIncident = {
        ...this.incident,
        formattedDate: '-',
        formattedCoordinates: '-'
      };
    }
  }
}
