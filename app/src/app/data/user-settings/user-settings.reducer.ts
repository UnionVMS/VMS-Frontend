import { createReducer, on } from '@ngrx/store';
import * as UserSettingsActions from './user-settings.actions';
import * as Types from './user-settings.types';

export const initialState: Types.State = {
  timezone: 'UTC',
  experimentalFeaturesEnabled: false,
};

export const userSettingsReducer = createReducer(initialState,
  on(UserSettingsActions.setTimezone, (state, { timezone }) => ({
    ...state,
    timezone
  })),
  on(UserSettingsActions.setExperimentalFeaturesEnabled, (state, { experimentalFeaturesEnabled }) => ({
    ...state,
    experimentalFeaturesEnabled
  })),
);
