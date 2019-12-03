import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { Position } from '@data/generic.interfaces';

@Component({
  selector: 'map-manual-position-form',
  templateUrl: './manual-position-form.component.html',
  styleUrls: ['./manual-position-form.component.scss']
})
export class ManualPositionFormComponent {
}
