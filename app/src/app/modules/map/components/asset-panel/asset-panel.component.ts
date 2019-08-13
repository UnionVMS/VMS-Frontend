import { Component, Input, ElementRef, Renderer2, OnChanges } from '@angular/core';
import { formatDate } from '@app/helpers';
import { AssetInterfaces } from '@data/asset';

@Component({
  selector: 'map-asset-panel',
  templateUrl: './asset-panel.component.html',
  styleUrls: ['./asset-panel.component.scss']
})
export class AssetPanelComponent implements OnChanges {
  @Input() assets: Array<{
    asset: AssetInterfaces.Asset,
    assetTracks: AssetInterfaces.AssetTrack,
    currentPosition: AssetInterfaces.AssetMovement,
    currentlyShowing: boolean
  }>;

  @Input() deselectAsset: (assetId: string) => void;
  @Input() getAssetTrack: (assetId: string, movementGuid: string) => void;
  @Input() getAssetTrackFromTime: (assetId: string, date: string) => void;
  @Input() untrackAsset: (assetId: string) => void;
  @Input() addForecast: (assetId: string) => void;
  @Input() removeForecast: (assetId: string) => void;
  @Input() selectAsset: (assetId: string) => void;
  @Input() forecasts: {};
  @Input() tracksMinuteCap: number;
  @Input() centerMapOnPosition: (longAndLat: {}) => void;

  public hidePanel = false;
  public activeAsset = null;
  public showButtons = false;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges() {
    this.activeAsset = this.assets.find((asset) => asset.currentlyShowing) || null;
  }

  toggleShowButtons() {
    this.showButtons = !this.showButtons;
  }

  goToAsset(asset) {
    this.centerMapOnPosition(asset.currentPosition.microMove.location);
  }

  // Extracting this code to separete function so we can override this code in unit-tests.
  private getTracksMillisecondCap() {
    const tracksMillisecondCap = this.tracksMinuteCap * 60 * 1000;
    return formatDate(Date.now() - tracksMillisecondCap);
  }

  private scrollTabs(direction) {
    if(direction === 'left') {
      this.elementRef.nativeElement.getElementsByClassName('tabs')[0].scrollLeft -= 150;
    } else if(direction === 'right') {
      this.elementRef.nativeElement.getElementsByClassName('tabs')[0].scrollLeft += 150;
    }
  }

  // We need this because angular templates are worthless, it does not support anonymous functions as parameters...
  private toggleTracksFactory = (asset) => {
    return () => this.toggleTracks(asset);
  }

  private toggleTracks = (asset): void => {
    if(this.tracksIsVisible(asset)) {
      this.untrackAsset(asset.asset.id);
    } else if(this.tracksMinuteCap === null) {
      this.getAssetTrack(asset.asset.id, asset.currentPosition.microMove.guid);
    } else {
      this.getAssetTrackFromTime(
        asset.asset.id,
        this.getTracksMillisecondCap()
      );
    }
  }

  // We need this because angular templates are worthless, it does not support anonymous functions as parameters...
  private toggleForecastFactory = (assetId) => {
    return () => this.toggleForecast(assetId);
  }

  private toggleForecast = (assetId): void => {
    if(this.forecastIsVisible(assetId)) {
      this.removeForecast(assetId);
    } else {
      this.addForecast(assetId);
    }
  }
  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

  private tracksIsVisible = (asset): boolean => {
    return typeof asset.assetTracks !== 'undefined';
  }
  private forecastIsVisible = (assetId): boolean => {
    return Object.keys(this.forecasts).indexOf(assetId) !== -1;
  }
}
