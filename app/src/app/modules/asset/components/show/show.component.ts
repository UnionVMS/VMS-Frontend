import { Component, Input } from '@angular/core';

import { AssetInterfaces } from '@data/asset';

@Component({
  selector: 'asset-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent {
  @Input() asset: AssetInterfaces.Asset;
}
