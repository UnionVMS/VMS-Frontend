import { Component, Input } from '@angular/core';

@Component({
  selector: 'map-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
  @Input() mapSettings;
  @Input() setTracksMinuteCap;
  @Input() clearForecasts;
  @Input() clearTracks;
  @Input() setForecastInterval;

  public hidePanel = false;

  private toggleVisibility = (): void => {
    this.hidePanel = !this.hidePanel;
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
