import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, scan, filter } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';

import { State } from '@app/app-reducer';
import { createUserSettingsFormValidator } from './form-validator';
import { errorMessage } from '@app/helpers/validators/error-messages';

import { MapSettingsTypes, MapSettingsActions, MapSettingsReducer, MapSettingsSelectors } from '@data/map-settings';
import { UserSettingsTypes, UserSettingsActions, UserSettingsReducer, UserSettingsSelectors } from '@data/user-settings';

@Component({
  selector: 'settings-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {

  constructor(private readonly store: Store<State>) { }

  public unmount$: Subject<boolean> = new Subject<boolean>();
  public save: () => void;
  public formValidator: FormGroup;
  public isFormReady = false;
  private mapSettings: MapSettingsTypes.Settings;
  private userSettings: UserSettingsTypes.State;

  public isDataFetched$: Subject<{ map?: boolean, user?: boolean}> = new Subject<{ map?: boolean, user?: boolean}>();

  public resetToDefault = () => {
    this.formValidator = createUserSettingsFormValidator(
      { ...MapSettingsReducer.initialState.settings },
      { ...UserSettingsReducer.initialState }
    );
  }

  mapStateToProps() {
    this.isDataFetched$.pipe(
      takeUntil(this.unmount$),
      scan((isSettingsReady, newValue) => {
        return { ...isSettingsReady, ...newValue };
      }, { map: false, user: false }),
      filter((isSettingsReady) => isSettingsReady.map === true && isSettingsReady.user === true)
    ).subscribe({
      next: (isSettingsReady) => {
        this.isFormReady = true;
        this.formValidator = createUserSettingsFormValidator(this.mapSettings, this.userSettings);
      }
    });

    this.store.select(MapSettingsSelectors.getMapSettings).pipe(takeUntil(this.unmount$)).subscribe((mapSettings) => {
      this.mapSettings = mapSettings;
      this.isDataFetched$.next({ map: Object.entries(mapSettings).length !== 0 });
    });
    this.store.select(UserSettingsSelectors.getUserSettings).pipe(takeUntil(this.unmount$)).subscribe((userSettings) => {
      this.userSettings = userSettings;
      this.isDataFetched$.next({ user: true });
    });
  }

  mapDispatchToProps() {
    this.save = () => {
      this.store.dispatch(MapSettingsActions.saveSettings({
        settings: {
          ...this.mapSettings,
          flagsVisible: this.formValidator.value.mapSettings.flagsVisible,
          tracksVisible: this.formValidator.value.mapSettings.tracksVisible,
          namesVisible: this.formValidator.value.mapSettings.namesVisible,
          speedsVisible: this.formValidator.value.mapSettings.speedsVisible,
          forecastsVisible: this.formValidator.value.mapSettings.forecastsVisible,
          startZoomLevel: this.formValidator.value.mapSettings.mapStartPosition.startZoomLevel,
          unitOfDistance: this.formValidator.value.mapSettings.unitOfDistance,
          startPosition: {
            latitude: parseFloat(this.formValidator.value.mapSettings.mapStartPosition.latitude),
            longitude: parseFloat(this.formValidator.value.mapSettings.mapStartPosition.longitude)
          },
          forecastInterval: parseInt(this.formValidator.value.mapSettings.mapLimits.forecastInterval, 10),
          tracksMinuteCap: parseInt(this.formValidator.value.mapSettings.mapLimits.tracksMinuteCap, 10),
          assetColorMethod: this.formValidator.value.mapSettings.assetColorMethod
        } as MapSettingsTypes.Settings
      }));
      this.store.dispatch(UserSettingsActions.setExperimentalFeaturesEnabled({
        experimentalFeaturesEnabled: this.formValidator.value.userSettings.experimentalFeaturesEnabled, save: true
      }));
    };
  }

  ngOnInit() {
    this.mapStateToProps();
    this.mapDispatchToProps();
  }

  ngOnDestroy() {
    this.unmount$.next(true);
    this.unmount$.unsubscribe();
  }

  getErrors(path: string[]): Array<{errorType: string, error: string }> {
    const errors = this.formValidator.get(path).errors;
    return errors === null ? [] : Object.keys(errors).map(errorType => ({ errorType, error: errors[errorType] }));
  }

  errorMessage(error: any) {
    return errorMessage(error.errorType, error.error);
  }

}
