import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers/helpers';
import { AssetTypes } from '@data/asset';
import { Position } from '@data/generic.types';

import { formatUnixtime } from '@app/helpers/datetime-formatter';
import { convertDDToDDM } from '@app/helpers/wgs84-formatter';

import getContryISO2 from 'country-iso-3-to-2';

// @ts-ignore
import moment from 'moment-timezone';

@Component({
  selector: 'map-asset-panel-show',
  templateUrl: './asset-panel-show.component.html',
  styleUrls: ['./asset-panel-show.component.scss']
})
export class AssetPanelShowComponent {
  @Input() asset: AssetTypes.AssetData;
  @Input() selectedAssetsLastPositions: AssetTypes.LastPositions;

  @Input() deselectAsset: (assetId: string) => void;
  @Input() getAssetTrack: (assetId: string, movementId: string) => void;
  @Input() getAssetTrackTimeInterval: (assetId: string, startDate: number, endDate: number) => void;
  @Input() getIncidentsForAssetId: (assetId: string) => void;
  @Input() getLicenceForAsset: (assetId: string) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() selectAsset: (assetId: string) => void;
  @Input() setActiveRightPanel: (rightPanel: ReadonlyArray<string>) => void;
  @Input() forecasts: {};
  @Input() tracksMinuteCap: number;
  @Input() centerMapOnPosition: (longAndLat: Position) => void;

  public expandFooterButtons = false;

  public toggleExpandFooterButtons() {
    this.expandFooterButtons = !this.expandFooterButtons;
  }

  public goToAsset(asset: AssetTypes.AssetData) {
    this.centerMapOnPosition(asset.currentPosition.movement.location);
  }

  // Extracting this code to separete function so we can override this code in unit-tests.
  private getTracksMillisecondCap() {
    const tracksMillisecondCap = this.tracksMinuteCap * 60 * 1000;
    return moment().subtract(tracksMillisecondCap, 'ms').format('x');
  }

  public toggleTracks = (asset: AssetTypes.AssetData) => {
    if(this.tracksIsVisible(asset)) {
      this.untrackAsset(asset.asset.id);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(asset.asset.id, asset.currentPosition.movement.id);
    } else {
      this.getAssetTrackTimeInterval(
        asset.asset.id,
        this.getTracksMillisecondCap(),
        moment().format('x')
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

  public tracksIsVisible = (asset: AssetTypes.AssetData): boolean => {
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

  formatDate(dateTime: number) {
    return formatUnixtime(dateTime);
  }

  formatLocation(location: Position) {
    const formattedPosition = convertDDToDDM(location.latitude, location.longitude, 2);
    return formattedPosition.latitude + ' ' + formattedPosition.longitude;
  }

  translateOceanRegion(sourceSatelliteId: string) {
    return AssetTypes.OceanRegionTranslation[sourceSatelliteId] || sourceSatelliteId;
  }

  getAisClass() {
    if(typeof this.selectedAssetsLastPositions.ais.status !== 'undefined' && this.selectedAssetsLastPositions.ais.status > '' ) {
      const typeNr = parseInt(this.selectedAssetsLastPositions.ais.status, 10);
      if(typeNr >= 1 && typeNr <= 3) {
        return $localize`:@@ts-movement-ais-class-a:Class A`;
      } else if(typeNr === 18) {
        return $localize`:@@ts-movement-ais-class-b:Class B`;
      }
    }
    return $localize`:@@ts-movement-ais-class-unkown:Unkown class`;
  }
}
