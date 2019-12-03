import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { Position } from '@data/generic.interfaces';

@Component({
  selector: 'map-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss']
})
export class IncidentComponent {
  @Input() asset: AssetInterfaces.AssetData;
  @Input() incident: AssetInterfaces.assetNotSendingIncident;
}
