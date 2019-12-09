import { Component, Input } from '@angular/core';
import { AssetInterfaces } from '@data/asset';
import { formatDate } from '@app/helpers/helpers';

@Component({
  selector: 'map-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent {
  @Input() incidents: ReadonlyArray<AssetInterfaces.assetNotSendingIncident>;
  @Input() selectIncident: (incident: AssetInterfaces.assetNotSendingIncident) => void;

  formatDate(incident) {
    const date = new Date(incident.lastKnownLocation.timestamp);
    const iso = date.toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2})/);
    return iso[1] + ' • ' + iso[2];
  }
}
