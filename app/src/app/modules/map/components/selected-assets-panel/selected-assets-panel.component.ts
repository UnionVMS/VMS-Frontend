import { Component, Input } from '@angular/core';
import getContryISO2 from 'country-iso-3-to-2';

import { AssetActions, AssetInterfaces, AssetSelectors } from '@data/asset';

@Component({
  selector: 'map-selected-assets-panel',
  templateUrl: './selected-assets-panel.component.html',
  styleUrls: ['./selected-assets-panel.component.scss']
})
export class SelectedAssetsPanelComponent {

  @Input() selectedAssets: ReadonlyArray<AssetInterfaces.AssetData>;
  @Input() selectAsset: (assetId: string) => void;
  @Input() clearSelectedAssets: () => void;
  @Input() deselectAsset: (assetId: string) => void;
  @Input() forecasts: {};
  @Input() getAssetTrack: (assetId: string, movementGuid: string) => void;
  @Input() getAssetTrackTimeInterval: (assetId: string, startDate: number, endDate: number) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() tracksMinuteCap: number;
  @Input() centerMapOnPosition: (position: Position) => void;

  public showControlPanel = false;

  public toggleControlPanel = () => {
    this.showControlPanel = !this.showControlPanel;
  }

  getCountryCode(asset) {
    const countryCode = getContryISO2(asset.asset.flagStateCode);
    if(typeof countryCode === 'undefined') {
      return '???';
    }
    return countryCode.toLowerCase();
  }

  selectAssetWrapper(assetId) {
    return () => this.selectAsset(assetId);
  }

  trackBySelectedAssets(index: number, asset: AssetInterfaces.AssetData) {
    return asset.asset.id;
  }
}
