import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { Position } from '@data/generic.interfaces';

import getContryISO2 from 'country-iso-3-to-2';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'map-asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() asset: AssetInterfaces.AssetData;

  @Input() deselectAsset: (assetId: string) => void;
  @Input() getAssetTrack: (assetId: string, movementGuid: string) => void;
  @Input() getAssetTrackTimeInterval: (assetId: string, startDate: number, endDate: number) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() selectAsset: (assetId: string) => void;
  @Input() forecasts: {};
  @Input() tracksMinuteCap: number;
  @Input() centerMapOnPosition: (longAndLat: Position) => void;

  public expandFooterButtons = false;

  public toggleExpandFooterButtons() {
    this.expandFooterButtons = !this.expandFooterButtons;
  }

  public goToAsset(asset: AssetInterfaces.AssetData) {
    this.centerMapOnPosition(asset.currentPosition.microMove.location);
  }

  // Extracting this code to separete function so we can override this code in unit-tests.
  private getTracksMillisecondCap() {
    const tracksMillisecondCap = this.tracksMinuteCap * 60 * 1000;
    return moment().subtract(tracksMillisecondCap, 'ms').format('X');
  }

  public toggleTracks = (asset: AssetInterfaces.AssetData) => {
    if(this.tracksIsVisible(asset)) {
      this.untrackAsset(asset.asset.id);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(asset.asset.id, asset.currentPosition.microMove.guid);
    } else {
      this.getAssetTrackTimeInterval(
        asset.asset.id,
        this.getTracksMillisecondCap(),
        moment().format('X')
      );
    }
  }

  public toggleForecast = (assetId: string) => {
    if(this.forecastIsVisible(assetId)) {
      this.removeForecast(assetId);
    } else {
      this.addForecast(assetId);
    }
  }

  public tracksIsVisible = (asset: AssetInterfaces.AssetData): boolean => {
    return typeof asset.assetTracks !== 'undefined';
  }
  public forecastIsVisible = (assetId: string): boolean => {
    return Object.keys(this.forecasts).indexOf(assetId) !== -1;
  }

  public getCountryCode() {
    const countryCode = getContryISO2(this.asset.asset.flagStateCode);
    if(typeof countryCode === 'undefined') {
      return '???';
    }
    return countryCode.toLowerCase();
  }

  public selectAssetWrapper() {
    return () => this.selectAsset(this.asset.asset.id);
  }

}
