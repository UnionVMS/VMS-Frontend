import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { takeWhile, endWith } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';

import { State } from '@app/app-reducer';
import { createUserSettingsFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

import { MapSettingsInterfaces, MapSettingsActions, MapSettingsReducer, MapSettingsSelectors } from '@data/map-settings';

@Component({
  selector: 'settings-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {

  constructor(private store: Store<State>) { }

  // tslint:disable:ban-types
  public save: Function;
  // tslint:enable:ban-types

  public formValidator: FormGroup;
  public isFormReady = false;
  private mapSettings: MapSettingsInterfaces.Settings;
  private mapSettingsSubscription: Subscription;

  public assetColorMethods = ['Shiptype', 'Flagstate', 'Size (length)'];

  public resetToDefault = () => {
    this.formValidator = createUserSettingsFormValidator({ ...MapSettingsReducer.initialState.settings });
  }

  mapStateToProps() {
    this.mapSettingsSubscription = this.store.select(MapSettingsSelectors.getMapSettings).subscribe((mapSettings) => {
      this.isFormReady = Object.entries(mapSettings).length !== 0;
      this.formValidator = createUserSettingsFormValidator(mapSettings);
      this.mapSettings = mapSettings;
    });
  }

  mapDispatchToProps() {
    this.save = (event) => {
      this.store.dispatch(MapSettingsActions.saveSettings({
        settings: {
          ...this.mapSettings,
          flagsVisible: this.formValidator.value.flagsVisible,
          tracksVisible: this.formValidator.value.tracksVisible,
          namesVisible: this.formValidator.value.namesVisible,
          speedsVisible: this.formValidator.value.speedsVisible,
          forecastsVisible: this.formValidator.value.forecastsVisible,
          startZoomLevel: this.formValidator.value.mapStartPosition.startZoomLevel,
          unitOfDistance: this.formValidator.value.unitOfDistance,
          startPosition: {
            latitude: parseFloat(this.formValidator.value.mapStartPosition.latitude),
            longitude: parseFloat(this.formValidator.value.mapStartPosition.longitude)
          },
          forecastInterval: parseInt(this.formValidator.value.mapLimits.forecastInterval, 10),
          tracksMinuteCap: parseInt(this.formValidator.value.mapLimits.tracksMinuteCap, 10),
          assetColorMethod: this.formValidator.value.assetColorMethod
        } as MapSettingsInterfaces.Settings
      }));
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

  getErrors(path: string[]): Array<{errorType: string, error: string }> {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors).map(errorType => ({ errorType, error: errors[errorType] }));
  }

  errorMessage(error: any) {
    return errorMessage(error.errorType, error.error);
  }

}
