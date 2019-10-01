import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'map-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnChanges {
  @Input() mapSettings;
  @Input() setTracksMinuteCap;
  @Input() clearForecasts;
  @Input() clearTracks;
  @Input() setForecastInterval;

  public hidePanel = false;
  public trackLength = '360';

  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
  }

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
    this.trackLength = this.mapSettings.tracksMinuteCap.toString();
  }
}
