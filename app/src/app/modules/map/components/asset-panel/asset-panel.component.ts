import { Component, Input } from '@angular/core';
import { formatDate } from '../../../../helpers';

@Component({
  selector: 'map-asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() asset;
  @Input() getAssetTrack;
  @Input() getAssetTrackFromTime;
  @Input() untrackAsset;
  @Input() addForecast;
  @Input() removeForecast;
  @Input() forecasts;
  @Input() tracksMinuteCap;

  public hidePanel = false;
  private toggleTracks = (): void => {
    if(this.tracksIsVisible()) {
      this.untrackAsset(this.asset.fullAsset.historyId);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(this.asset.fullAsset.historyId, this.asset.currentPosition.microMove.guid);
    } else {
      const tracksMillisecondCap = this.tracksMinuteCap * 60 * 1000;
      this.getAssetTrackFromTime(
        this.asset.fullAsset.historyId,
        formatDate(Date.now() - tracksMillisecondCap)
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
