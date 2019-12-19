import { Component, Input } from '@angular/core';
import { IncidentInterfaces } from '@data/incident';
import { formatDate } from '@app/helpers/helpers';

@Component({
  selector: 'map-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent {
  @Input() incidents: ReadonlyArray<IncidentInterfaces.assetNotSendingIncident>;
  @Input() incidentNotifications: IncidentInterfaces.incidentNotificationsCollections;
  @Input() selectIncident: (incident: IncidentInterfaces.assetNotSendingIncident) => void;

  public incidentStatusClass = {
    MANUAL_POSITION_MODE: 'dangerLvl1',
    ATTEMPTED_CONTACT: 'dangerLvl5',
    RESOLVED: 'dangerLvl0',
  };

  formatDate(incident: IncidentInterfaces.assetNotSendingIncident) {
    const date = new Date((incident.lastKnownLocation.timestamp as number) * 1000);
    const iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2})/);
    return iso[1] + ' • ' + iso[2];
  }
}
