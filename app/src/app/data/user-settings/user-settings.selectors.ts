import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as UserSettingsInterface from './user-settings.types';
import { State } from '@app/app-reducer';

export const selectUserSettings = (state: State) => state.userSettings;
export const selectTimezone = (state: State) => state.userSettings.timezone;
export const selectExperimentalFeaturesEnabled = (state: State) => state.userSettings.experimentalFeaturesEnabled;


export const getUserSettings = createSelector(
  selectUserSettings,
  (userSettings: UserSettingsInterface.State) => userSettings
);

export const getTimezone = createSelector(
  selectTimezone,
  (timezone: string) => timezone
);

export const getExperimentalFeaturesEnabled = createSelector(
  selectExperimentalFeaturesEnabled,
  (experimentalFeaturesEnabled: boolean) => experimentalFeaturesEnabled
);
