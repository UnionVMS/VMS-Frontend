import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';

import { IncidentTypes } from '@data/incident';
import { formatUnixtimeWithDot } from '@app/helpers/datetime-formatter';
import { AssetIncidentsDialogComponent } from '@modules/map/components/asset-incidents-dialog/asset-incidents-dialog.component';

@Component({
  selector: 'map-asset-incidents',
  templateUrl: './asset-incidents.component.html',
  styleUrls: ['./asset-incidents.component.scss']
})
export class AssetIncidentsComponent {
  @Input() incidents: ReadonlyArray<IncidentTypes.Incident>;
  // @Input() incidentNotifications: IncidentTypes.IncidentNotificationsCollections;
  @Input() selectIncident: (incident: IncidentTypes.Incident) => void;
  @Input() setActiveWorkflow: (workflow: ReadonlyArray<string>) => void;
  @Input() currentWorkflow: string;

  constructor(public dialog: MatDialog) { }

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

  openSelectIncidentDialog(incident: IncidentTypes.Incident): void {
    if(this.currentWorkflow === incident.type) {
      this.selectIncident(incident);
    } else {
      const dialogRef = this.dialog.open(AssetIncidentsDialogComponent, {
        data: { currentWorkflow: this.currentWorkflow, incidentType: incident.type }
      });

      dialogRef.afterClosed().pipe(first()).subscribe(resultDetach => {
        if(resultDetach === true) {
          this.selectIncident(incident);
        } else if(resultDetach === 'switch-workflow') {
          this.setActiveWorkflow(['workflows', incident.type]);
          this.selectIncident(incident);
        }
      });
    }
  }
}
