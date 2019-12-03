import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { Position } from '@data/generic.interfaces';

@Component({
  selector: 'map-incident-status-form',
  templateUrl: './incident-status-form.component.html',
  styleUrls: ['./incident-status-form.component.scss']
})
export class IncidentStatusFormComponent {
}
