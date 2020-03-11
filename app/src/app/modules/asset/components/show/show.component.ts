import { Component, Input } from '@angular/core';
import getContryISO2 from 'country-iso-3-to-2';

import { AssetInterfaces } from '@data/asset';

@Component({
  selector: 'asset-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent {
  @Input() asset: AssetInterfaces.Asset;

  public getCountryCode() {
    const countryCode = getContryISO2(this.asset.flagStateCode);
    if(typeof countryCode === 'undefined') {
      return '???';
    }
    return countryCode.toLowerCase();
  }
}
