import { Component, Input } from '@angular/core';
import { MapSettingsInterfaces } from '@data/map-settings';

@Component({
  selector: 'map-layer-filter',
  templateUrl: './layer-filter.component.html',
  styleUrls: ['./layer-filter.component.scss']
})
export class LayerFilterComponent {
  @Input() mapSettings: MapSettingsInterfaces.State;
  @Input() setVisibilityForAssetNames: (visibility: boolean) => void;
  @Input() setVisibilityForAssetSpeeds: (visibility: boolean) => void;
  @Input() setVisibilityForTracks: (visibility: boolean) => void;
  @Input() setVisibilityForFlags: (visibility: boolean) => void;
  @Input() setVisibilityForForecast: (visibility: boolean) => void;
  @Input() flagsDisabled: boolean;
  @Input() tracksDisabled: boolean;
  @Input() namesDisabled: boolean;
  @Input() speedsDisabled: boolean;
  @Input() forecastsDisabled: boolean;

  public toggleNames = (): void => {
    this.setVisibilityForAssetNames(!this.mapSettings.settings.namesVisible);
  }
  public toggleSpeeds = (): void => {
    this.setVisibilityForAssetSpeeds(!this.mapSettings.settings.speedsVisible);
  }
  public toggleFlags = (): void => {
    this.setVisibilityForFlags(!this.mapSettings.settings.flagsVisible);
  }
  public toggleTracks = (): void => {
    this.setVisibilityForTracks(!this.mapSettings.settings.tracksVisible);
  }
  public toggleForecast = (): void => {
    this.setVisibilityForForecast(!this.mapSettings.settings.forecastsVisible);
  }
}
