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

  public toggleNames = (): void => {
    this.setVisibilityForAssetNames(!this.mapSettings.namesVisible);
  }
  public toggleSpeeds = (): void => {
    this.setVisibilityForAssetSpeeds(!this.mapSettings.speedsVisible);
  }
  public toggleFlags = (): void => {
    this.setVisibilityForFlags(!this.mapSettings.flagsVisible);
  }
  public toggleTracks = (): void => {
    this.setVisibilityForTracks(!this.mapSettings.tracksVisible);
  }
  public toggleForecast = (): void => {
    this.setVisibilityForForecast(!this.mapSettings.forecastsVisible);
  }
}
