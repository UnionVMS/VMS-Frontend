import { Component, Input } from '@angular/core';

@Component({
  selector: 'asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent {
  @Input() asset;
  @Input() getAssetTrack;
  @Input() untrackAsset;
  @Input() addForecast;
  @Input() removeForecast;
  @Input() forecasts;

  private hidePanel = false;
  private toggleTracks: Function = () => {
    if(this.tracksIsVisible()) {
      this.untrackAsset(this.asset.fullAsset.historyId);
    } else {
      this.getAssetTrack(this.asset.fullAsset.historyId, this.asset.currentPosition.microMove.guid);
    }
  }
  private toggleForecast: Function = () => {
    if(this.forecastIsVisible()) {
      this.removeForecast(this.asset.fullAsset.historyId);
    } else {
      this.addForecast(this.asset.fullAsset.historyId);
    }
  }
  private toggleVisibility: Function = () => {
    this.hidePanel = !this.hidePanel;
  }

  private tracksIsVisible: Function = (): boolean => {
    return typeof this.asset.assetTracks !== 'undefined';
  }
  private forecastIsVisible: Function = (): boolean => {
    return Object.keys(this.forecasts).indexOf(this.asset.fullAsset.historyId) !== -1;
  }
}
