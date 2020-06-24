import { Component, Input } from '@angular/core';
import { IncidentTypes } from '@data/incident';
import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';

@Component({
  selector: 'map-asset-incidents',
  templateUrl: './asset-incidents.component.html',
  styleUrls: ['./asset-incidents.component.scss']
})
export class AssetIncidentsComponent {
  @Input() incidents: ReadonlyArray<IncidentTypes.Incident>;
  // @Input() incidentNotifications: IncidentTypes.IncidentNotificationsCollections;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;

  public incidentStatusClass = {
    MANUAL_POSITION_MODE: 'dangerLvl1',
    ATTEMPTED_CONTACT: 'dangerLvl5',
    LONG_TERM_PARKED: 'dangerLvl0',
    RESOLVED: 'dangerLvl0',
  };

  public trackByIncidents = (index: number, item: IncidentTypes.Incident) => {
    return item.id;
  }

  formatDate(incident: IncidentTypes.Incident) {
    if(typeof incident.lastKnownLocation === 'undefined') {
      return 'Unknown';
    }
    return formatUnixtimeWithDot(incident.lastKnownLocation.timestamp);
  }
}
