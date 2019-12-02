import { Component, Input } from '@angular/core';
import { AssetInterfaces } from '@data/asset';
import { formatDate } from '@app/helpers/helpers';

@Component({
  selector: 'map-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent {
  @Input() incidents: ReadonlyArray<any>;

  formatDate(incident) {
    return formatDate(incident.lastKnownLocation.timestamp);
  }
}
