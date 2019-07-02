import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'map-layer-filter',
  templateUrl: './layer-filter.component.html',
  styleUrls: ['./layer-filter.component.scss']
})
export class LayerFilterComponent implements OnChanges {
  @Input() mapSettings;
  @Input() setVisibilityForAssetNames;
  @Input() setVisibilityForAssetSpeeds;
  @Input() setVisibilityForTracks;
  @Input() setVisibilityForFlags;
  @Input() setVisibilityForForecast;
  @Input() map;
  @Input() saveViewport;

  public viewportKeys = [];

  ngOnChanges() {
    this.viewportKeys = Object.keys(this.mapSettings.viewports);
  }

  private toggleNames = (): void => {
    this.setVisibilityForAssetNames(!this.mapSettings.namesVisible);
  }
  private toggleSpeeds = (): void => {
    this.setVisibilityForAssetSpeeds(!this.mapSettings.speedsVisible);
  }
  private toggleFlags = (): void => {
    this.setVisibilityForFlags(!this.mapSettings.flagsVisible);
  }
  private toggleTracks = (): void => {
    this.setVisibilityForTracks(!this.mapSettings.tracksVisible);
  }
  private toggleForecast = (): void => {
    this.setVisibilityForForecast(!this.mapSettings.forecastsVisible);
  }
}
