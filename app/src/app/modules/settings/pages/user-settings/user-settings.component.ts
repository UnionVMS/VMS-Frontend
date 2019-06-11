import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { takeWhile, endWith } from 'rxjs/operators';

import { MapSettingsInterfaces, MapSettingsActions, MapSettingsReducer, MapSettingsSelectors } from '@data/map-settings';

@Component({
  selector: 'settings-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {

  constructor(private store: Store<MapSettingsInterfaces.State>) { }

  // tslint:disable:ban-types
  public save: Function;
  // tslint:enable:ban-types

  public mapSettings;
  private mapSettingsSubscription;

  public assetColorMethods = ['Random', 'Shiptype', 'Flagstate', 'Size (length)'];


  public toggleFlags = (event) => {
    this.mapSettings.flagsVisible = !this.mapSettings.flagsVisible;
  }

  public toggleTracks = (event) => {
    this.mapSettings.tracksVisible = !this.mapSettings.tracksVisible;
  }

  public toggleNames = (event) => {
    this.mapSettings.namesVisible = !this.mapSettings.namesVisible;
  }

  public toggleSpeeds = (event) => {
    this.mapSettings.speedsVisible = !this.mapSettings.speedsVisible;
  }

  public toggleForecasts = (event) => {
    this.mapSettings.forecastsVisible = !this.mapSettings.forecastsVisible;
  }

  public saveToLocalstorage = (event) => {
    // @ts-ignore
    this.mapSettings.startZoomLevel = parseFloat(this.mapSettings.startZoomLevel);
    // @ts-ignore
    this.mapSettings.startPosition.latitude = parseFloat(this.mapSettings.startPosition.latitude);
    // @ts-ignore
    this.mapSettings.startPosition.longitude = parseFloat(this.mapSettings.startPosition.longitude);

    window.localStorage.mySettings = JSON.stringify({
      mapSettings: this.mapSettings
    });
  }

  public resetToDefault = () => {
    this.mapSettings = { ...MapSettingsReducer.initialState };
  }

  mapStateToProps() {
    this.mapSettingsSubscription = this.store.select(MapSettingsSelectors.getMapSettingsState).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
    });
  }

  mapDispatchToProps() {
    this.save = (event) => {
      this.saveToLocalstorage(event);
      this.store.dispatch(new MapSettingsActions.ReplaceSettings(this.mapSettings));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    if(this.mapSettingsSubscription !== undefined) {
      this.mapSettingsSubscription.unsubscribe();
    }
  }

}
