import { Component, Input } from '@angular/core';
import { IncidentTypes } from '@data/incident';
import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'map-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent {
  @Input() incidents: ReadonlyArray<IncidentTypes.assetNotSendingIncident>;
  @Input() incidentNotifications: IncidentTypes.incidentNotificationsCollections;
  @Input() selectIncident: (incident: IncidentTypes.assetNotSendingIncident) => void;

  public resolved = false;

  public incidentStatusClass = {
    MANUAL_POSITION_MODE: 'dangerLvl1',
    ATTEMPTED_CONTACT: 'dangerLvl5',
    RESOLVED: 'dangerLvl0',
  };

  public trackByIncidents = (index: number, item: IncidentTypes.assetNotSendingIncident) => {
    return item.assetId + '-' + (this.resolved ? 'r' : 'nr');
  }

  public switchShowResolved = () => {
    this.resolved = !this.resolved;
  }

  formatDate(incident: IncidentTypes.assetNotSendingIncident) {
    return formatUnixtimeWithDot(incident.lastKnownLocation.timestamp);
  }
}
