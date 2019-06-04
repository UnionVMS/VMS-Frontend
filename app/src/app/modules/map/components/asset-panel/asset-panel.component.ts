import { Component, Input } from '@angular/core';
import { formatDate } from '@app/helpers';
import { AssetInterfaces } from '@data/asset';

@Component({
  selector: 'map-asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() asset: {
    asset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement
  };

  @Input() getAssetTrack: (assetId: string, movementGuid: string) => void;
  @Input() getAssetTrackFromTime: (assetId: string, date: string) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() forecasts: {};
  @Input() tracksMinuteCap: number;

  public hidePanel = false;

  // Extracting this code to separete function so we can override this code in unit-tests.
  private getTracksMillisecondCap() {
    const tracksMillisecondCap = this.tracksMinuteCap * 60 * 1000;
    return formatDate(Date.now() - tracksMillisecondCap);
  }

  private toggleTracks = (): void => {
    if(this.tracksIsVisible()) {
      this.untrackAsset(this.asset.asset.id);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(this.asset.asset.id, this.asset.currentPosition.microMove.guid);
    } else {
      this.getAssetTrackFromTime(
        this.asset.asset.id,
        this.getTracksMillisecondCap()
      );
    }
  }
  private toggleForecast = (): void => {
    if(this.forecastIsVisible()) {
      this.removeForecast(this.asset.asset.id);
    } else {
      this.addForecast(this.asset.asset.id);
    }
  }
  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

  private tracksIsVisible = (): boolean => {
    return typeof this.asset.assetTracks !== 'undefined';
  }
  private forecastIsVisible = (): boolean => {
    return Object.keys(this.forecasts).indexOf(this.asset.asset.id) !== -1;
  }
}
