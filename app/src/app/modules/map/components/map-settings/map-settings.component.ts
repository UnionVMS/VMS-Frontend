import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'map-settings',
  templateUrl: './map-settings.component.html',
  styleUrls: ['./map-settings.component.scss']
})
export class MapSettingsComponent implements OnChanges {
  @Input() mapSettings;
  @Input() setVisibilityForAssetNames;
  @Input() setVisibilityForAssetSpeeds;
  @Input() setVisibilityForTracks;
  @Input() setVisibilityForFlags;
  @Input() setVisibilityForForecast;
  @Input() setTracksMinuteCap;
  @Input() clearForecasts;
  @Input() clearTracks;
  @Input() map;
  @Input() saveViewport;
  @Input() setForecastInterval;

  public hidePanel = false;
  public viewportKeys = [];

  ngOnChanges() {
    this.viewportKeys = Object.keys(this.mapSettings.viewports);
  }

  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
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
  private setTracksMinuteCapFunction = (event): void => {
    let minutes = parseInt(event.target.value, 10);
    if(event.target.value.length === 0) {
      minutes = 200;
    }
    this.setTracksMinuteCap(minutes);
  }
  private setForecastIntervalFunction = (event): void => {
    let minutes = parseInt(event.target.value, 10);
    if(event.target.value.length === 0) {
      minutes = 30;
    }
    this.setForecastInterval(minutes);
  }
}
