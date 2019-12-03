import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers/helpers';
import { AssetInterfaces } from '@data/asset';
import { Position } from '@data/generic.interfaces';

@Component({
  selector: 'map-asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() asset: AssetInterfaces.AssetData;

  @Input() deselectAsset: (assetId: string) => void;
  @Input() getAssetTrack: (assetId: string, movementGuid: string) => void;
  @Input() getAssetTrackTimeInterval: (assetId: string, startDate: string, endDate: string) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() selectAsset: (assetId: string) => void;
  @Input() forecasts: {};
  @Input() tracksMinuteCap: number;
  @Input() centerMapOnPosition: (longAndLat: Position) => void;

  public activeAsset = null;
  public showButtons = false;

  toggleShowButtons() {
    this.showButtons = !this.showButtons;
  }

  goToAsset(asset: AssetInterfaces.AssetData) {
    this.centerMapOnPosition(asset.currentPosition.microMove.location);
  }

  // Extracting this code to separete function so we can override this code in unit-tests.
  private getTracksMillisecondCap() {
    const tracksMillisecondCap = this.tracksMinuteCap * 60 * 1000;
    return formatDate(Date.now() - tracksMillisecondCap);
  }

  // We need this because angular templates are worthless, it does not support anonymous functions as parameters...
  public toggleTracksFactory = (asset: AssetInterfaces.AssetData) => {
    return () => this.toggleTracks(asset);
  }

  private toggleTracks = (asset: AssetInterfaces.AssetData): void => {
    if(this.tracksIsVisible(asset)) {
      this.untrackAsset(asset.asset.id);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(asset.asset.id, asset.currentPosition.microMove.guid);
    } else {
      this.getAssetTrackTimeInterval(
        asset.asset.id,
        this.getTracksMillisecondCap(),
        formatDate(Date.now())
      );
    }
  }

  // We need this because angular templates are worthless, it does not support anonymous functions as parameters...
  public toggleForecastFactory = (assetId: string) => {
    return () => this.toggleForecast(assetId);
  }

  private toggleForecast = (assetId: string): void => {
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
}
