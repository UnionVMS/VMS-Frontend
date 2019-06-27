import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers';
import { AssetInterfaces } from '@data/asset';

@Component({
  selector: 'map-asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() assets: Array<{
    asset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement
  }>;

  @Input() deselectAsset: (assetId: string) => void;
  @Input() getAssetTrack: (assetId: string, movementGuid: string) => void;
  @Input() getAssetTrackFromTime: (assetId: string, date: string) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() forecasts: {};
  @Input() tracksMinuteCap: number;

  public hidePanel = false;
  public activeAssetTabAsset = null;

  // Extracting this code to separete function so we can override this code in unit-tests.
  private getTracksMillisecondCap() {
    const tracksMillisecondCap = this.tracksMinuteCap * 60 * 1000;
    return formatDate(Date.now() - tracksMillisecondCap);
  }

  private setActive(assetId) {
    this.activeAssetTabAsset = this.assets.find((asset) => asset.asset.id === assetId);
    console.warn(this.activeAssetTabAsset);
  }

  private toggleTracks = (): void => {
    if(this.tracksIsVisible()) {
      this.untrackAsset(this.activeAssetTabAsset.asset.id);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(this.activeAssetTabAsset.asset.id, this.activeAssetTabAsset.currentPosition.microMove.guid);
    } else {
      this.getAssetTrackFromTime(
        this.activeAssetTabAsset.asset.id,
        this.getTracksMillisecondCap()
      );
    }
  }
  private toggleForecast = (): void => {
    if(this.forecastIsVisible()) {
      this.removeForecast(this.activeAssetTabAsset.asset.id);
    } else {
      this.addForecast(this.activeAssetTabAsset.asset.id);
    }
  }
  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

  private tracksIsVisible = (): boolean => {
    return typeof this.activeAssetTabAsset.assetTracks !== 'undefined';
  }
  private forecastIsVisible = (): boolean => {
    return Object.keys(this.forecasts).indexOf(this.activeAssetTabAsset.asset.id) !== -1;
  }
}
