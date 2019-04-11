import { Component, Input } from '@angular/core';

@Component({
  selector: 'map-settings',
  templateUrl: './map-settings.component.html',
  styleUrls: ['./map-settings.component.scss']
})
export class MapSettingsComponent {
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
  private toggleVisibility: Function = () => {
    this.hidePanel = !this.hidePanel;
  }


  private toggleNames: Function = () => {
    this.setVisibilityForAssetNames(!this.mapSettings.namesVisible);
  }
  private toggleSpeeds: Function = () => {
    this.setVisibilityForAssetSpeeds(!this.mapSettings.speedsVisible);
  }
  private toggleFlags: Function = () => {
    this.setVisibilityForFlags(!this.mapSettings.flagsVisible);
  }
  private toggleTracks: Function = () => {
    this.setVisibilityForTracks(!this.mapSettings.tracksVisible);
  }
  private toggleForecast: Function = () => {
    this.setVisibilityForForecast(!this.mapSettings.forecastsVisible);
  }
  private setTracksMinuteCapFunction: Function = (event) => {
    let minutes = parseInt(event.target.value);
    if(event.target.value.length === 0) {
      minutes = null;
    }
    this.setTracksMinuteCap(minutes);
  }
  private setForecastIntervalFunction: Function = (event) => {
    let minutes = parseInt(event.target.value);
    if(event.target.value.length === 0) {
      minutes = null;
    }
    this.setForecastInterval(minutes);
  }
}
