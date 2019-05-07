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
    fullAsset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement
  };

  @Input() getAssetTrack: (historyId: string, movementGuid: string) => void;
  @Input() getAssetTrackFromTime: (historyId: string, date: string) => void;
  @Input() untrackAsset: (historyId: string) => void;
  @Input() addForecast: (historyId: string) => void;
  @Input() removeForecast: (historyId: string) => void;
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
      this.untrackAsset(this.asset.fullAsset.historyId);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(this.asset.fullAsset.historyId, this.asset.currentPosition.microMove.guid);
    } else {
      this.getAssetTrackFromTime(
        this.asset.fullAsset.historyId,
        this.getTracksMillisecondCap()
      );
    }
  }
  private toggleForecast = (): void => {
    if(this.forecastIsVisible()) {
      this.removeForecast(this.asset.fullAsset.historyId);
    } else {
      this.addForecast(this.asset.fullAsset.historyId);
    }
  }
  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

  private tracksIsVisible = (): boolean => {
    return typeof this.asset.assetTracks !== 'undefined';
  }
  private forecastIsVisible = (): boolean => {
    return Object.keys(this.forecasts).indexOf(this.asset.fullAsset.historyId) !== -1;
  }
}
