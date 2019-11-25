import { Component, Input, OnChanges } from '@angular/core';
import * as MapSettingsInterfaces from '@data/map-settings/map-settings.interfaces';

@Component({
  selector: 'map-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnChanges {
  @Input() mapSettings: MapSettingsInterfaces.State;
  @Input() setTracksMinuteCap: (minutes: number) => void;
  @Input() clearForecasts: () => void;
  @Input() clearTracks: () => void;
  @Input() setForecastInterval: (forecastTimeLength: number) => void;

  public trackLength = '360';

  private setTracksMinuteCapFunction = (event): void => {
    let minutes = parseInt(event.value, 10);
    if(event.value.length === 0) {
      minutes = 360;
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

  ngOnChanges() {
    this.trackLength = this.mapSettings.settings.tracksMinuteCap.toString();
  }
}
